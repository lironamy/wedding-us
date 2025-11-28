import Guest from '@/lib/db/models/Guest';
import Table from '@/lib/db/models/Table';
import GuestGroup from '@/lib/db/models/GuestGroup';
import SeatAssignment from '@/lib/db/models/SeatAssignment';
import SeatingPreference from '@/lib/db/models/SeatingPreference';
import TableAdjacency from '@/lib/db/models/TableAdjacency';
import Wedding, { ISeatingSettings } from '@/lib/db/models/Wedding';
import GroupPriority from '@/lib/db/models/GroupPriority';

// Local interfaces for type safety
interface GuestData {
  _id: string;
  name: string;
  groupId?: any;
  familyGroup?: string;
  rsvpStatus: string;
  adultsAttending?: number;
  childrenAttending?: number;
  expectedPartySize?: number;
  invitedCount?: number;
  lockedSeat?: boolean;
  lockedTableId?: any;
  guestType?: 'single' | 'couple' | 'family' | 'group';
  seatingPreference?: 'stage' | 'dance' | 'quiet' | 'any';
  createdAt: Date;
}

// Helper to auto-detect guest type based on party composition
function detectGuestType(guest: GuestData): 'single' | 'couple' | 'family' | 'group' {
  // If already set, use existing value
  if (guest.guestType) {
    return guest.guestType;
  }

  const adults = guest.adultsAttending || 0;
  const children = guest.childrenAttending || 0;
  const total = adults + children;

  // Family: has children
  if (children > 0) {
    return 'family';
  }

  // Single: exactly 1 adult
  if (adults === 1 || total === 1) {
    return 'single';
  }

  // Couple: exactly 2 adults
  if (adults === 2) {
    return 'couple';
  }

  // Group: more than 2 adults
  return 'group';
}

// Helper to check if a table is "couple heavy" (mostly couples/pairs)
function isCoupleHeavyTable(
  cache: SeatingCache,
  tableId: string
): boolean {
  const assignments = cache.assignments.get(tableId) || [];
  if (assignments.length === 0) return false;

  let coupleCount = 0;
  let singleCount = 0;

  for (const assignment of assignments) {
    const guest = cache.guests.get(assignment.guestId.toString());
    if (!guest) continue;

    const guestType = detectGuestType(guest);
    if (guestType === 'couple') {
      coupleCount++;
    } else if (guestType === 'single') {
      singleCount++;
    }
  }

  // Table is couple-heavy if more than 60% are couples and there's at most 1 single
  const totalGuests = assignments.length;
  return coupleCount > 0 && (coupleCount / totalGuests) >= 0.5 && singleCount <= 1;
}

interface TableData {
  _id: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  mode: string;
  groupId?: any;
  clusterIndex?: number;
  locked?: boolean;
  tableType?: 'adults' | 'kids' | 'mixed';
  zone?: 'stage' | 'dance' | 'quiet' | 'general';
}

interface AssignmentData {
  _id: string;
  guestId: any;
  tableId: any;
  seatsCount: number;
  assignmentType: string;
}

interface PreferenceData {
  _id: string;
  guestAId: any;
  guestBId: any;
  type: string;
  scope: string;
  strength: string;
  enabled: boolean;
}

interface GroupData {
  _id: string;
  name: string;
  priority?: number;
}

interface GroupPriorityData {
  _id: string;
  weddingId: string;
  groupName: string;
  priority: number;
}

export type AssignmentType = 'real' | 'simulation';
export type RecalcStrategy = 'groupOnly' | 'all';

export interface SeatingConflict {
  type: 'apart_cannot_satisfy' | 'together_cannot_satisfy' | 'no_available_table';
  guestAId: string;
  guestBId?: string;
  guestAName: string;
  guestBName?: string;
  message: string;
  suggestedAction: string;
}

export interface AutoSeatingResult {
  success: boolean;
  assignmentsCreated: number;
  tablesCreated: number;
  conflicts: SeatingConflict[];
  error?: string;
}

interface GuestUnit {
  guestId: string;
  guest: GuestData;
  seatsCount: number;
  originalSeatsCount: number; // Store original count before any deductions
}

// Cache for in-memory operations during seating calculation
interface SeatingCache {
  tables: Map<string, TableData>;
  tablesByGroup: Map<string | null, TableData[]>;
  assignments: Map<string, AssignmentData[]>; // tableId -> assignments
  guestAssignments: Map<string, AssignmentData[]>; // guestId -> assignments
  preferences: PreferenceData[];
  apartPreferencesByGuest: Map<string, PreferenceData[]>;
  togetherPreferencesByGuest: Map<string, PreferenceData[]>;
  adjacencies: Map<string, string[]>; // tableId -> adjacent tableIds
  guests: Map<string, GuestData>;
  groups: Map<string, GroupData>;
  groupPriorities: Map<string, number>; // groupName -> priority (1 = first, 2 = second, etc.)
  maxTableNumber: number;
  maxClusterIndexByGroup: Map<string | null, number>;
}

// Initialize cache with all data loaded upfront
async function initializeCache(weddingId: string, type: AssignmentType): Promise<SeatingCache> {
  // Load all data in parallel
  const [tables, assignments, preferences, adjacencies, groups, guests, priorities] = await Promise.all([
    Table.find({ weddingId }).lean() as unknown as Promise<TableData[]>,
    SeatAssignment.find({ weddingId, assignmentType: type }).lean() as unknown as Promise<AssignmentData[]>,
    SeatingPreference.find({ weddingId, enabled: true }).lean() as unknown as Promise<PreferenceData[]>,
    TableAdjacency.find({ weddingId }).lean() as unknown as Promise<any[]>,
    GuestGroup.find({ weddingId }).lean() as unknown as Promise<GroupData[]>,
    Guest.find({ weddingId }).lean() as unknown as Promise<GuestData[]>,
    GroupPriority.find({ weddingId }).lean() as unknown as Promise<GroupPriorityData[]>,
  ]);

  // Build cache structures
  const cache: SeatingCache = {
    tables: new Map(),
    tablesByGroup: new Map(),
    assignments: new Map(),
    guestAssignments: new Map(),
    preferences,
    apartPreferencesByGuest: new Map(),
    togetherPreferencesByGuest: new Map(),
    adjacencies: new Map(),
    guests: new Map(),
    groups: new Map(),
    groupPriorities: new Map(),
    maxTableNumber: 0,
    maxClusterIndexByGroup: new Map(),
  };

  // Index group priorities (groupName -> priority number)
  for (const priority of priorities) {
    if (priority.priority > 0) {
      cache.groupPriorities.set(priority.groupName, priority.priority);
    }
  }

  // Index tables
  for (const table of tables) {
    const tableId = table._id.toString();
    cache.tables.set(tableId, table);
    cache.maxTableNumber = Math.max(cache.maxTableNumber, table.tableNumber);

    const groupId = table.groupId?.toString() || null;
    if (!cache.tablesByGroup.has(groupId)) {
      cache.tablesByGroup.set(groupId, []);
    }
    cache.tablesByGroup.get(groupId)!.push(table);

    // Track max cluster index per group for auto tables
    if (table.mode === 'auto') {
      const currentMax = cache.maxClusterIndexByGroup.get(groupId) || 0;
      cache.maxClusterIndexByGroup.set(groupId, Math.max(currentMax, table.clusterIndex || 0));
    }

    // Initialize empty assignments array
    cache.assignments.set(tableId, []);
  }

  // Index assignments
  for (const assignment of assignments) {
    const tableId = assignment.tableId.toString();
    const guestId = assignment.guestId.toString();

    if (!cache.assignments.has(tableId)) {
      cache.assignments.set(tableId, []);
    }
    cache.assignments.get(tableId)!.push(assignment);

    if (!cache.guestAssignments.has(guestId)) {
      cache.guestAssignments.set(guestId, []);
    }
    cache.guestAssignments.get(guestId)!.push(assignment);
  }

  // Index preferences by guest
  for (const pref of preferences) {
    const guestAId = pref.guestAId.toString();
    const guestBId = pref.guestBId.toString();

    if (pref.type === 'apart') {
      if (!cache.apartPreferencesByGuest.has(guestAId)) {
        cache.apartPreferencesByGuest.set(guestAId, []);
      }
      if (!cache.apartPreferencesByGuest.has(guestBId)) {
        cache.apartPreferencesByGuest.set(guestBId, []);
      }
      cache.apartPreferencesByGuest.get(guestAId)!.push(pref);
      cache.apartPreferencesByGuest.get(guestBId)!.push(pref);
    } else if (pref.type === 'together') {
      if (!cache.togetherPreferencesByGuest.has(guestAId)) {
        cache.togetherPreferencesByGuest.set(guestAId, []);
      }
      if (!cache.togetherPreferencesByGuest.has(guestBId)) {
        cache.togetherPreferencesByGuest.set(guestBId, []);
      }
      cache.togetherPreferencesByGuest.get(guestAId)!.push(pref);
      cache.togetherPreferencesByGuest.get(guestBId)!.push(pref);
    }
  }

  // Index adjacencies
  for (const adj of adjacencies) {
    const tableId = adj.tableId.toString();
    const adjTableId = adj.adjacentTableId.toString();

    if (!cache.adjacencies.has(tableId)) {
      cache.adjacencies.set(tableId, []);
    }
    if (!cache.adjacencies.has(adjTableId)) {
      cache.adjacencies.set(adjTableId, []);
    }
    cache.adjacencies.get(tableId)!.push(adjTableId);
    cache.adjacencies.get(adjTableId)!.push(tableId);
  }

  // Index guests and groups
  for (const guest of guests) {
    cache.guests.set(guest._id.toString(), guest);
  }
  for (const group of groups) {
    cache.groups.set(group._id.toString(), group);
  }

  return cache;
}

// Get occupied seats from cache
function getOccupiedSeatsFromCache(cache: SeatingCache, tableId: string): number {
  const assignments = cache.assignments.get(tableId) || [];
  return assignments.reduce((sum, a) => sum + a.seatsCount, 0);
}

// Get adjacent table IDs from cache (with fallback to table number proximity)
function getAdjacentTableIdsFromCache(cache: SeatingCache, tableId: string): string[] {
  // First try explicit adjacency
  const explicit = cache.adjacencies.get(tableId);
  if (explicit && explicit.length > 0) {
    return explicit;
  }

  // Fallback to table number proximity
  const currentTable = cache.tables.get(tableId);
  if (!currentTable) return [];

  const adjacent: string[] = [];
  for (const [id, table] of cache.tables) {
    if (
      table.tableNumber === currentTable.tableNumber - 1 ||
      table.tableNumber === currentTable.tableNumber + 1
    ) {
      adjacent.push(id);
    }
  }
  return adjacent;
}

// Get guests at table from cache
function getGuestsAtTableFromCache(cache: SeatingCache, tableId: string): Set<string> {
  const assignments = cache.assignments.get(tableId) || [];
  return new Set(assignments.map(a => a.guestId.toString()));
}

// Check if guest can be placed at table (using cache)
function canPlaceGuestAtTableFromCache(
  cache: SeatingCache,
  guestId: string,
  tableId: string,
  adjacencyPolicy: 'forbidSameTableOnly' | 'forbidSameAndAdjacent',
  avoidSinglesAlone: boolean = true
): { canPlace: boolean; conflictWith?: string; reason?: string } {
  const guest = cache.guests.get(guestId);
  const table = cache.tables.get(tableId);

  // Never place adults in kids table
  if (table?.tableType === 'kids' && guest) {
    const guestType = detectGuestType(guest);
    // Only allow if guest has children (they're placing their children there)
    if (guestType !== 'family' && (guest.childrenAttending || 0) === 0) {
      return { canPlace: false, reason: 'adults_in_kids_table' };
    }
  }

  // Check singles placement rule
  if (avoidSinglesAlone && guest) {
    const guestType = detectGuestType(guest);
    if (guestType === 'single') {
      // Check if this table is couple-heavy and already has 0-1 singles
      if (isCoupleHeavyTable(cache, tableId)) {
        // Count existing singles at this table
        const assignments = cache.assignments.get(tableId) || [];
        let existingSingles = 0;
        for (const a of assignments) {
          const g = cache.guests.get(a.guestId.toString());
          if (g && detectGuestType(g) === 'single') {
            existingSingles++;
          }
        }
        // Don't place a single alone - need at least one other single friend
        if (existingSingles === 0) {
          return { canPlace: false, reason: 'singles_alone' };
        }
      }
    }
  }

  const apartPreferences = cache.apartPreferencesByGuest.get(guestId) || [];
  if (apartPreferences.length === 0) {
    return { canPlace: true };
  }

  const guestsAtTable = getGuestsAtTableFromCache(cache, tableId);

  // Check same table
  for (const pref of apartPreferences) {
    const otherGuestId = pref.guestAId.toString() === guestId
      ? pref.guestBId.toString()
      : pref.guestAId.toString();

    if (guestsAtTable.has(otherGuestId)) {
      return { canPlace: false, conflictWith: otherGuestId };
    }
  }

  // Check adjacent tables if policy requires
  if (adjacencyPolicy === 'forbidSameAndAdjacent') {
    const adjacentTableIds = getAdjacentTableIdsFromCache(cache, tableId);

    for (const adjTableId of adjacentTableIds) {
      const guestsAtAdjTable = getGuestsAtTableFromCache(cache, adjTableId);

      for (const pref of apartPreferences) {
        if (pref.scope !== 'adjacentTables') continue;

        const otherGuestId = pref.guestAId.toString() === guestId
          ? pref.guestBId.toString()
          : pref.guestAId.toString();

        if (guestsAtAdjTable.has(otherGuestId)) {
          return { canPlace: false, conflictWith: otherGuestId };
        }
      }
    }
  }

  return { canPlace: true };
}

// Score placement for "together" preferences (using cache)
function scorePlacementFromCache(
  cache: SeatingCache,
  guestId: string,
  tableId: string
): number {
  let score = 0;

  const togetherPreferences = cache.togetherPreferencesByGuest.get(guestId) || [];
  if (togetherPreferences.length === 0) {
    return 0;
  }

  const guestsAtTable = getGuestsAtTableFromCache(cache, tableId);
  const adjacentTableIds = getAdjacentTableIdsFromCache(cache, tableId);

  const guestsAtAdjacentTables = new Set<string>();
  for (const adjTableId of adjacentTableIds) {
    const adjGuests = getGuestsAtTableFromCache(cache, adjTableId);
    adjGuests.forEach(g => guestsAtAdjacentTables.add(g));
  }

  for (const pref of togetherPreferences) {
    const otherGuestId = pref.guestAId.toString() === guestId
      ? pref.guestBId.toString()
      : pref.guestAId.toString();

    const multiplier = pref.strength === 'must' ? 2 : 1;

    if (guestsAtTable.has(otherGuestId)) {
      // Same table - always good
      score += 100 * multiplier;
    } else if (pref.scope === 'adjacentTables' && guestsAtAdjacentTables.has(otherGuestId)) {
      // Adjacent table - only counts if scope allows it
      score += 50 * multiplier;
    }
  }

  return score;
}

// Add assignment to cache
function addAssignmentToCache(
  cache: SeatingCache,
  tableId: string,
  guestId: string,
  seatsCount: number,
  type: AssignmentType
): void {
  const assignment: AssignmentData = {
    _id: `temp-${Date.now()}-${Math.random()}`,
    tableId,
    guestId,
    seatsCount,
    assignmentType: type,
  };

  if (!cache.assignments.has(tableId)) {
    cache.assignments.set(tableId, []);
  }
  cache.assignments.get(tableId)!.push(assignment);

  if (!cache.guestAssignments.has(guestId)) {
    cache.guestAssignments.set(guestId, []);
  }
  cache.guestAssignments.get(guestId)!.push(assignment);
}

// Add table to cache
function addTableToCache(cache: SeatingCache, table: TableData): void {
  const tableId = table._id.toString();
  cache.tables.set(tableId, table);

  const groupId = table.groupId?.toString() || null;
  if (!cache.tablesByGroup.has(groupId)) {
    cache.tablesByGroup.set(groupId, []);
  }
  cache.tablesByGroup.get(groupId)!.push(table);

  cache.assignments.set(tableId, []);
  cache.maxTableNumber = Math.max(cache.maxTableNumber, table.tableNumber);

  if (table.mode === 'auto') {
    const currentMax = cache.maxClusterIndexByGroup.get(groupId) || 0;
    cache.maxClusterIndexByGroup.set(groupId, Math.max(currentMax, table.clusterIndex || 0));
  }
}

// Get active guests
export async function getActiveGuests(
  weddingId: string,
  type: AssignmentType
): Promise<GuestUnit[]> {
  const guests = await Guest.find({
    weddingId,
    ...(type === 'real'
      ? { rsvpStatus: 'confirmed' }
      : { rsvpStatus: { $in: ['confirmed', 'pending'] } }),
  }).lean() as unknown as GuestData[];

  return guests.map((guest) => {
    let seatsCount: number;
    if (type === 'real') {
      // Real mode: use actual confirmed attendance
      seatsCount = (guest.adultsAttending || 0) + (guest.childrenAttending || 0);
    } else {
      // Simulation mode:
      // - Confirmed guests: use their actual attendance numbers
      // - Non-confirmed guests: count as 1 seat for planning
      if (guest.rsvpStatus === 'confirmed') {
        seatsCount = (guest.adultsAttending || 0) + (guest.childrenAttending || 0);
      } else {
        seatsCount = 1;
      }
    }
    const finalSeatsCount = Math.max(1, seatsCount);
    return {
      guestId: guest._id.toString(),
      guest,
      seatsCount: finalSeatsCount,
      originalSeatsCount: finalSeatsCount, // Store original for verification
    };
  }).filter((unit) => unit.seatsCount > 0);
}

// Create a new table (with cache update)
async function createGroupTableWithCache(
  weddingId: string,
  groupId: string | null,
  seatsPerTable: number,
  groupName: string | undefined,
  cache: SeatingCache
): Promise<TableData> {
  const maxClusterIndex = cache.maxClusterIndexByGroup.get(groupId) || 0;
  const nextClusterIndex = maxClusterIndex + 1;
  const nextTableNumber = cache.maxTableNumber + 1;

  const newTable = await Table.create({
    weddingId,
    tableName: groupName
      ? `${groupName} ${nextClusterIndex}`
      : `שולחן ${nextTableNumber}`,
    tableNumber: nextTableNumber,
    capacity: seatsPerTable,
    tableType: 'mixed',
    mode: 'auto',
    groupId: groupId || undefined,
    clusterIndex: nextClusterIndex,
    locked: false,
  });

  const tableData = newTable.toObject() as unknown as TableData;

  // Update cache
  addTableToCache(cache, tableData);
  cache.maxClusterIndexByGroup.set(groupId, nextClusterIndex);

  return tableData;
}

// Helper function to shift table numbers when inserting a new table
async function shiftTableNumbersFrom(
  weddingId: string,
  fromTableNumber: number,
  cache: SeatingCache
): Promise<void> {
  // Find all tables with tableNumber >= fromTableNumber and shift them +1
  const tablesToShift: TableData[] = [];
  for (const [, table] of cache.tables) {
    if (table.tableNumber >= fromTableNumber) {
      tablesToShift.push(table);
    }
  }

  // Sort descending to avoid conflicts (shift highest first)
  tablesToShift.sort((a, b) => b.tableNumber - a.tableNumber);

  // Update in database and cache
  for (const table of tablesToShift) {
    const newNumber = table.tableNumber + 1;
    await Table.findByIdAndUpdate(table._id, { tableNumber: newNumber });
    table.tableNumber = newNumber;
    if (newNumber > cache.maxTableNumber) {
      cache.maxTableNumber = newNumber;
    }
  }
}

// Place seats for a guest in family group (supports both groupId and familyGroup)
// This algorithm:
// 1. Finds existing tables for the group with available space
// 2. Fills existing tables first (splitting across tables if needed)
// 3. When creating new table for group, inserts it NEXT to existing group tables
// 4. Shifts other tables' numbers to maintain adjacency
async function placeSeatsForGuestInFamilyGroup(
  weddingId: string,
  groupKey: string,
  guestUnit: GuestUnit,
  type: AssignmentType,
  seatsPerTable: number,
  adjacencyPolicy: 'forbidSameTableOnly' | 'forbidSameAndAdjacent',
  groupName: string | undefined,
  cache: SeatingCache,
  pendingAssignments: Array<{ weddingId: string; tableId: string; guestId: string; seatsCount: number; assignmentType: string }>,
  tablesByGroupKey: Map<string, TableData[]>,
  avoidSinglesAlone: boolean = true,
  enableZonePlacement: boolean = false
): Promise<{ assignmentsCreated: number; tablesCreated: number; conflicts: SeatingConflict[] }> {
  let seatsNeeded = guestUnit.seatsCount;
  let assignmentsCreated = 0;
  let tablesCreated = 0;
  const conflicts: SeatingConflict[] = [];

  // Get or initialize tables for this group key
  if (!tablesByGroupKey.has(groupKey)) {
    tablesByGroupKey.set(groupKey, []);
  }
  const groupTables = tablesByGroupKey.get(groupKey)!;

  // Sort group tables by table number for consistent filling order
  groupTables.sort((a, b) => a.tableNumber - b.tableNumber);

  while (seatsNeeded > 0) {
    // Find tables with space from this group's tables
    const tablesWithSpace: Array<{
      table: TableData;
      freeSeats: number;
      score: number;
    }> = [];

    for (const table of groupTables) {
      const tableId = table._id.toString();
      const occupiedSeats = getOccupiedSeatsFromCache(cache, tableId);
      const freeSeats = table.capacity - occupiedSeats;

      // Skip tables that are full or over capacity
      if (freeSeats <= 0) continue;

      // Check zone preference if enabled
      if (enableZonePlacement && guestUnit.guest.seatingPreference && guestUnit.guest.seatingPreference !== 'any') {
        const tableZone = table.zone || 'general';
        const guestPreference = guestUnit.guest.seatingPreference;
        // Skip tables that don't match the guest's zone preference (unless it's general)
        if (tableZone !== 'general' && tableZone !== guestPreference) {
          continue;
        }
      }

      const canPlace = canPlaceGuestAtTableFromCache(cache, guestUnit.guestId, tableId, adjacencyPolicy, avoidSinglesAlone);

      if (!canPlace.canPlace) {
        if (canPlace.conflictWith) {
          const conflictGuest = cache.guests.get(canPlace.conflictWith);
          conflicts.push({
            type: 'apart_cannot_satisfy',
            guestAId: guestUnit.guestId,
            guestBId: canPlace.conflictWith,
            guestAName: guestUnit.guest.name,
            guestBName: conflictGuest?.name || 'Unknown',
            message: `לא ניתן לשבץ את ${guestUnit.guest.name} בשולחן ${table.tableNumber} בגלל כלל "לא ליד"`,
            suggestedAction: 'נסה לבטל את כלל ה"לא ליד" או לשנות ידנית',
          });
        }
        // Note: If reason is 'singles_alone', we don't add a conflict - just skip and try another table
        continue;
      }

      const score = scorePlacementFromCache(cache, guestUnit.guestId, tableId);
      tablesWithSpace.push({ table, freeSeats, score });
    }

    // Sort by table number first (fill earlier tables first), then by score
    // Also consider zone matching for better placement
    tablesWithSpace.sort((a, b) => {
      // First priority: zone matching (if zone placement enabled)
      if (enableZonePlacement && guestUnit.guest.seatingPreference && guestUnit.guest.seatingPreference !== 'any') {
        const aZoneMatch = a.table.zone === guestUnit.guest.seatingPreference ? 1 : 0;
        const bZoneMatch = b.table.zone === guestUnit.guest.seatingPreference ? 1 : 0;
        if (aZoneMatch !== bZoneMatch) return bZoneMatch - aZoneMatch;
      }
      // Second priority: fill tables with lower numbers (earlier in sequence)
      if (a.table.tableNumber !== b.table.tableNumber) {
        return a.table.tableNumber - b.table.tableNumber;
      }
      // Third priority: score from "together" preferences
      if (b.score !== a.score) return b.score - a.score;
      return 0;
    });

    let targetTable: TableData;
    let freeSeats: number;

    if (tablesWithSpace.length > 0) {
      targetTable = tablesWithSpace[0].table;
      freeSeats = tablesWithSpace[0].freeSeats;
    } else {
      // Need to create new table for this group
      // Determine where to insert it (right after the last group table)
      let insertAtTableNumber: number;
      let tableZone: 'stage' | 'dance' | 'quiet' | 'general' = 'general';

      // Determine zone for new table based on guest preference
      if (enableZonePlacement && guestUnit.guest.seatingPreference && guestUnit.guest.seatingPreference !== 'any') {
        tableZone = guestUnit.guest.seatingPreference;
      }

      if (groupTables.length > 0) {
        // Insert right after the highest-numbered group table
        const lastGroupTable = groupTables.reduce((max, t) =>
          t.tableNumber > max.tableNumber ? t : max, groupTables[0]);
        insertAtTableNumber = lastGroupTable.tableNumber + 1;

        // Check if there's already a table at this number (not part of our group)
        const tableAtInsertPosition = Array.from(cache.tables.values()).find(
          t => t.tableNumber === insertAtTableNumber
        );

        if (tableAtInsertPosition && !groupTables.includes(tableAtInsertPosition)) {
          // Need to shift tables to make room
          await shiftTableNumbersFrom(weddingId, insertAtTableNumber, cache);
        }
      } else {
        // No existing tables for this group - use next available number
        insertAtTableNumber = cache.maxTableNumber + 1;
      }

      const tableIndex = groupTables.length + 1;

      const newTableName = groupName
        ? `${groupName} ${tableIndex}`
        : `שולחן ${insertAtTableNumber}`;

      const newTable = await Table.create({
        weddingId,
        tableName: newTableName,
        tableNumber: insertAtTableNumber,
        capacity: seatsPerTable,
        tableType: 'mixed',
        zone: tableZone,
        mode: 'auto',
        locked: false,
      });

      targetTable = newTable.toObject() as unknown as TableData;

      // Update cache
      addTableToCache(cache, targetTable);
      groupTables.push(targetTable);

      // Re-sort group tables after adding new one
      groupTables.sort((a, b) => a.tableNumber - b.tableNumber);

      freeSeats = seatsPerTable;
      tablesCreated++;
    }

    // Place as many seats as possible in this table
    const tableId = targetTable._id.toString();
    const occupiedBefore = getOccupiedSeatsFromCache(cache, tableId);
    const actualFreeSeats = targetTable.capacity - occupiedBefore;
    const seatsToPlace = Math.min(actualFreeSeats, seatsNeeded);

    console.log(`[PLACEMENT] Guest: ${guestUnit.guest.name}, Table: ${targetTable.tableName} (${targetTable.tableNumber}), ` +
      `Capacity: ${targetTable.capacity}, Occupied: ${occupiedBefore}, Free: ${actualFreeSeats}, ` +
      `SeatsNeeded: ${seatsNeeded}, SeatsToPlace: ${seatsToPlace}`);

    if (seatsToPlace <= 0) {
      // Table is full, continue loop to create a new one
      console.log(`[PLACEMENT] Table ${targetTable.tableName} is full, need to create new table`);
      continue;
    }

    // Add to pending assignments
    pendingAssignments.push({
      weddingId,
      tableId,
      guestId: guestUnit.guestId,
      seatsCount: seatsToPlace,
      assignmentType: type,
    });

    // Update cache
    addAssignmentToCache(cache, tableId, guestUnit.guestId, seatsToPlace, type);

    assignmentsCreated++;
    seatsNeeded -= seatsToPlace;
    console.log(`[PLACEMENT] Placed ${seatsToPlace} seats, remaining: ${seatsNeeded}`);
  }

  return { assignmentsCreated, tablesCreated, conflicts };
}

// Place seats for a guest (optimized with cache) - legacy function for groupId-based groups
async function placeSeatsForGuestOptimized(
  weddingId: string,
  groupId: string | null,
  guestUnit: GuestUnit,
  type: AssignmentType,
  seatsPerTable: number,
  adjacencyPolicy: 'forbidSameTableOnly' | 'forbidSameAndAdjacent',
  groupName: string | undefined,
  cache: SeatingCache,
  pendingAssignments: Array<{ weddingId: string; tableId: string; guestId: string; seatsCount: number; assignmentType: string }>,
  avoidSinglesAlone: boolean = true,
  enableZonePlacement: boolean = false
): Promise<{ assignmentsCreated: number; tablesCreated: number; conflicts: SeatingConflict[] }> {
  let seatsNeeded = guestUnit.seatsCount;
  let assignmentsCreated = 0;
  let tablesCreated = 0;
  const conflicts: SeatingConflict[] = [];

  while (seatsNeeded > 0) {
    // Get tables for this group from cache
    const groupTables = (cache.tablesByGroup.get(groupId) || [])
      .filter(t => t.mode === 'auto')
      .sort((a, b) => (a.clusterIndex || 0) - (b.clusterIndex || 0));

    // Find tables with space
    const tablesWithSpace: Array<{
      table: TableData;
      freeSeats: number;
      score: number;
    }> = [];

    for (const table of groupTables) {
      if (table.locked) continue;

      const tableId = table._id.toString();
      const occupiedSeats = getOccupiedSeatsFromCache(cache, tableId);
      const freeSeats = table.capacity - occupiedSeats;

      if (freeSeats <= 0) continue;

      // Check zone preference if enabled
      if (enableZonePlacement && guestUnit.guest.seatingPreference && guestUnit.guest.seatingPreference !== 'any') {
        const tableZone = table.zone || 'general';
        const guestPreference = guestUnit.guest.seatingPreference;
        if (tableZone !== 'general' && tableZone !== guestPreference) {
          continue;
        }
      }

      const canPlace = canPlaceGuestAtTableFromCache(cache, guestUnit.guestId, tableId, adjacencyPolicy, avoidSinglesAlone);

      if (!canPlace.canPlace) {
        if (canPlace.conflictWith) {
          const conflictGuest = cache.guests.get(canPlace.conflictWith);
          conflicts.push({
            type: 'apart_cannot_satisfy',
            guestAId: guestUnit.guestId,
            guestBId: canPlace.conflictWith,
            guestAName: guestUnit.guest.name,
            guestBName: conflictGuest?.name || 'Unknown',
            message: `לא ניתן לשבץ את ${guestUnit.guest.name} בשולחן ${table.tableNumber} בגלל כלל "לא ליד"`,
            suggestedAction: 'נסה לבטל את כלל ה"לא ליד" או לשנות ידנית',
          });
        }
        continue;
      }

      const score = scorePlacementFromCache(cache, guestUnit.guestId, tableId);
      tablesWithSpace.push({ table, freeSeats, score });
    }

    // Sort by zone match, score, free seats, cluster index
    tablesWithSpace.sort((a, b) => {
      // First priority: zone matching
      if (enableZonePlacement && guestUnit.guest.seatingPreference && guestUnit.guest.seatingPreference !== 'any') {
        const aZoneMatch = a.table.zone === guestUnit.guest.seatingPreference ? 1 : 0;
        const bZoneMatch = b.table.zone === guestUnit.guest.seatingPreference ? 1 : 0;
        if (aZoneMatch !== bZoneMatch) return bZoneMatch - aZoneMatch;
      }
      if (b.score !== a.score) return b.score - a.score;
      if (b.freeSeats !== a.freeSeats) return b.freeSeats - a.freeSeats;
      return (a.table.clusterIndex || 0) - (b.table.clusterIndex || 0);
    });

    let targetTable: TableData;
    let freeSeats: number;

    if (tablesWithSpace.length > 0) {
      targetTable = tablesWithSpace[0].table;
      freeSeats = tablesWithSpace[0].freeSeats;
    } else {
      // Create new table
      targetTable = await createGroupTableWithCache(weddingId, groupId, seatsPerTable, groupName, cache);
      freeSeats = seatsPerTable;
      tablesCreated++;
    }

    const seatsToPlace = Math.min(freeSeats, seatsNeeded);
    const tableId = targetTable._id.toString();

    // Add to pending assignments (batch insert later)
    pendingAssignments.push({
      weddingId,
      tableId,
      guestId: guestUnit.guestId,
      seatsCount: seatsToPlace,
      assignmentType: type,
    });

    // Update cache
    addAssignmentToCache(cache, tableId, guestUnit.guestId, seatsToPlace, type);

    assignmentsCreated++;
    seatsNeeded -= seatsToPlace;
  }

  return { assignmentsCreated, tablesCreated, conflicts };
}

// Main auto seating function (optimized)
export async function buildAutoSeating(
  weddingId: string,
  type: AssignmentType,
  strategy: RecalcStrategy = 'all'
): Promise<AutoSeatingResult> {
  try {
    // Get wedding settings
    const wedding = await Wedding.findById(weddingId).lean() as any;
    if (!wedding) {
      return {
        success: false,
        assignmentsCreated: 0,
        tablesCreated: 0,
        conflicts: [],
        error: 'Wedding not found',
      };
    }

    const seatingSettings: ISeatingSettings = {
      mode: 'manual',
      seatsPerTable: 12,
      autoRecalcPolicy: 'onRsvpChangeGroupOnly',
      adjacencyPolicy: 'forbidSameTableOnly',
      simulationEnabled: false,
      enableKidsTable: false,
      kidsTableMinAge: 6,
      kidsTableMinCount: 6,
      avoidSinglesAlone: true,
      enableZonePlacement: false,
      ...wedding.seatingSettings,
    };

    // Initialize cache with all data
    const cache = await initializeCache(weddingId, type);

    // Get active guests
    const guestUnits = await getActiveGuests(weddingId, type);

    // Separate locked and free guests
    // A guest is considered "locked" if:
    // 1. They have lockedSeat or lockedTableId flag set, OR
    // 2. They are already assigned to a LOCKED table
    const guestsInLockedTables = new Set<string>();

    // We need to check both SeatAssignment AND Table.assignedGuests
    // because manual assignments might only be in Table.assignedGuests
    const lockedTablesWithGuests = await Table.find({
      weddingId,
      locked: true,
    }).populate('assignedGuests', '_id name').lean() as any[];

    for (const table of lockedTablesWithGuests) {
      if (table.assignedGuests && table.assignedGuests.length > 0) {
        for (const guest of table.assignedGuests) {
          const guestId = guest._id?.toString() || guest.toString();
          guestsInLockedTables.add(guestId);
        }
      }
    }

    // Also check SeatAssignment for locked tables (in case they exist there)
    for (const [tableId, table] of cache.tables) {
      if (table.locked) {
        const assignments = cache.assignments.get(tableId) || [];
        for (const assignment of assignments) {
          guestsInLockedTables.add(assignment.guestId.toString());
        }
      }
    }

    const lockedGuests = guestUnits.filter(
      (unit) => unit.guest.lockedSeat || unit.guest.lockedTableId || guestsInLockedTables.has(unit.guestId)
    );
    const freeGuests = guestUnits.filter(
      (unit) => !unit.guest.lockedSeat && !unit.guest.lockedTableId && !guestsInLockedTables.has(unit.guestId)
    );

    // Get all unlocked tables (both auto and manual) for clearing assignments
    const lockedGuestIds = lockedGuests.map((g) => g.guestId);
    const unlockedTableIds: string[] = [];
    const autoTableIds: string[] = [];

    for (const [tableId, table] of cache.tables) {
      if (!table.locked) {
        unlockedTableIds.push(tableId);
        if (table.mode === 'auto') {
          autoTableIds.push(tableId);
        }
      }
    }

    // Delete existing assignments from ALL unlocked tables
    // This includes assignments for locked guests that somehow ended up in unlocked tables
    console.log(`[CLEANUP] Deleting ${type} assignments from ${unlockedTableIds.length} unlocked tables`);
    const deleteResult = await SeatAssignment.deleteMany({
      weddingId,
      assignmentType: type,
      tableId: { $in: unlockedTableIds },
    });
    console.log(`[CLEANUP] Deleted ${deleteResult.deletedCount} assignments`);

    // Clear ALL assignedGuests from unlocked tables
    // Locked guests should only be in locked tables - if they're in unlocked tables, remove them
    console.log(`[CLEANUP] Clearing assignedGuests from ${unlockedTableIds.length} unlocked tables`);
    const clearResult = await Table.updateMany(
      { _id: { $in: unlockedTableIds } },
      { $set: { assignedGuests: [] } }
    );
    console.log(`[CLEANUP] Modified ${clearResult.modifiedCount} tables`);

    // Also remove duplicates from locked tables (cleanup existing data)
    const lockedTables = await Table.find({ weddingId, locked: true }).lean() as any[];
    for (const table of lockedTables) {
      if (table.assignedGuests && table.assignedGuests.length > 0) {
        const uniqueGuests = [...new Set(table.assignedGuests.map((g: any) => g.toString()))];
        if (uniqueGuests.length !== table.assignedGuests.length) {
          console.log(`[CLEANUP] Removing ${table.assignedGuests.length - uniqueGuests.length} duplicates from locked table ${table.tableName}`);
          await Table.findByIdAndUpdate(table._id, { $set: { assignedGuests: uniqueGuests } });
        }
      }
    }

    // Clear assignments from cache for all unlocked tables
    for (const tableId of unlockedTableIds) {
      const existing = cache.assignments.get(tableId) || [];
      const kept = existing.filter(a => lockedGuestIds.includes(a.guestId.toString()));
      cache.assignments.set(tableId, kept);
    }

    // ============================================================
    // KIDS TABLE LOGIC
    // If enabled, count total children and create kids table if threshold met
    // ============================================================
    let kidsTableId: string | null = null;
    let totalKidsCount = 0;

    if (seatingSettings.enableKidsTable) {
      // Count total children from ALL guests (including locked ones)
      for (const unit of guestUnits) {
        const kids = unit.guest.childrenAttending || 0;
        totalKidsCount += kids;
      }

      // Create kids table if we have enough children
      if (totalKidsCount >= (seatingSettings.kidsTableMinCount || 6)) {
        // First check if there's already a kids table in the database (including locked ones)
        const existingKidsTableInDb = await Table.findOne({
          weddingId,
          tableType: 'kids',
        }).lean() as TableData | null;

        if (existingKidsTableInDb) {
          // Use existing kids table
          kidsTableId = existingKidsTableInDb._id.toString();

          // Make sure it's in the cache
          if (!cache.tables.has(kidsTableId)) {
            addTableToCache(cache, existingKidsTableInDb);
          }

          // Clear its assignments (we'll reassign children)
          cache.assignments.set(kidsTableId, []);
        } else {
          // Create new kids table
          const kidsTableNumber = cache.maxTableNumber + 1;
          const newKidsTable = await Table.create({
            weddingId,
            tableName: 'שולחן ילדים',
            tableNumber: kidsTableNumber,
            capacity: Math.max(totalKidsCount + 2, seatingSettings.seatsPerTable), // At least seatsPerTable or enough for all kids
            tableType: 'kids',
            mode: 'auto',
            locked: false,
          });

          const kidsTableData = newKidsTable.toObject() as unknown as TableData;
          addTableToCache(cache, kidsTableData);
          kidsTableId = kidsTableData._id.toString();
        }
      }
    }

    // Group guests by groupId or familyGroup
    // Priority: groupId (reference to GuestGroup) > familyGroup (string)
    const guestsByGroup = new Map<string, GuestUnit[]>();
    const groupKeyToName = new Map<string, string>(); // For naming tables

    for (const unit of freeGuests) {
      let groupKey: string;
      let groupName: string | undefined;

      if (unit.guest.groupId) {
        // Use GuestGroup reference
        groupKey = `group:${unit.guest.groupId.toString()}`;
        const group = cache.groups.get(unit.guest.groupId.toString());
        groupName = group?.name;
      } else if (unit.guest.familyGroup) {
        // Use familyGroup string
        groupKey = `family:${unit.guest.familyGroup}`;
        groupName = unit.guest.familyGroup;
      } else {
        // No group - use "unassigned"
        groupKey = 'none';
        groupName = undefined;
      }

      if (!guestsByGroup.has(groupKey)) {
        guestsByGroup.set(groupKey, []);
        if (groupName) {
          groupKeyToName.set(groupKey, groupName);
        }
      }
      guestsByGroup.get(groupKey)!.push(unit);
    }

    // Sort groups - first by priority (1 first, then 2, etc.), then groups without priority, then 'none'
    // Groups with priority get processed first and will get lower table numbers
    const sortedGroupKeys = Array.from(guestsByGroup.keys()).sort((a, b) => {
      // 'none' group always goes last
      if (a === 'none') return 1;
      if (b === 'none') return -1;

      // Get group names to look up priorities
      const nameA = groupKeyToName.get(a) || '';
      const nameB = groupKeyToName.get(b) || '';

      // Get priorities (0 or undefined means no priority)
      const priorityA = cache.groupPriorities.get(nameA) || 0;
      const priorityB = cache.groupPriorities.get(nameB) || 0;

      // Groups with priority come before groups without
      if (priorityA > 0 && priorityB === 0) return -1;
      if (priorityA === 0 && priorityB > 0) return 1;

      // Both have priority - lower priority number comes first (1 before 2)
      if (priorityA > 0 && priorityB > 0) {
        return priorityA - priorityB;
      }

      // Both have no priority - sort alphabetically
      return nameA.localeCompare(nameB, 'he');
    });

    let totalAssignments = 0;
    let totalTablesCreated = 0;
    const allConflicts: SeatingConflict[] = [];
    const pendingAssignments: Array<{ weddingId: string; tableId: string; guestId: string; seatsCount: number; assignmentType: string }> = [];

    // Track tables per group key (for familyGroup support)
    // Pre-populate with existing tables from cache
    const tablesByGroupKey = new Map<string, TableData[]>();

    // Map existing tables to their group keys based on:
    // 1. groupId reference (if exists)
    // 2. table name matching group name from groupKeyToName
    // 3. table name pattern (e.g., "משפחת כהן 1" -> "family:משפחת כהן")
    // 4. Generic tables (like "שולחן 1") go to 'none' group
    // NOTE: Include locked tables - they can still be filled, just not renumbered
    for (const [tableId, table] of cache.tables) {
      let matchedGroupKey: string | null = null;

      // Check if table has a groupId reference
      if (table.groupId) {
        matchedGroupKey = `group:${table.groupId.toString()}`;
      } else {
        // Try to match table name to group names from current guests
        // Tables created for familyGroups are named like "משפחת כהן 1", "משפחת כהן 2"
        for (const [groupKey, groupName] of groupKeyToName.entries()) {
          // Check if table name starts with the group name
          if (groupName && table.tableName.startsWith(groupName)) {
            matchedGroupKey = groupKey;
            break;
          }
        }

        // If no match found in current guests, try to extract family group from table name
        // Pattern: "משפחת X 1" or "חברים Y 1" etc. -> extract the group name part
        if (!matchedGroupKey && !table.tableName.startsWith('שולחן')) {
          // Extract group name by removing the trailing number (e.g., "משפחת כהן 1" -> "משפחת כהן")
          const match = table.tableName.match(/^(.+?)\s+\d+$/);
          if (match) {
            const extractedGroupName = match[1];
            matchedGroupKey = `family:${extractedGroupName}`;
            // Also add to groupKeyToName so future tables can find it
            if (!groupKeyToName.has(matchedGroupKey)) {
              groupKeyToName.set(matchedGroupKey, extractedGroupName);
            }
          }
        }

        // If no group match found, check if it's a generic table (for 'none' group)
        // Generic tables are named like "שולחן 1", "שולחן 2", etc.
        // BUT exclude kids tables - they have their own special handling
        if (!matchedGroupKey && table.tableName.startsWith('שולחן') && table.tableType !== 'kids') {
          matchedGroupKey = 'none';
        }
      }

      if (matchedGroupKey) {
        if (!tablesByGroupKey.has(matchedGroupKey)) {
          tablesByGroupKey.set(matchedGroupKey, []);
        }
        tablesByGroupKey.get(matchedGroupKey)!.push(table);
      }
    }

    // RENUMBER TABLES BASED ON GROUP PRIORITY
    // When priorities exist, we need to renumber existing auto tables so that
    // priority 1 groups get table numbers 1, 2, etc.
    if (cache.groupPriorities.size > 0) {
      // Get all unlocked auto tables
      const autoTablesToRenumber: TableData[] = [];
      for (const [, table] of cache.tables) {
        if (table.mode === 'auto' && !table.locked) {
          autoTablesToRenumber.push(table);
        }
      }

      // Find the lowest table number we should start from (respect locked tables)
      let minLockedTableNumber = Infinity;
      for (const [, table] of cache.tables) {
        if (table.locked && table.tableNumber < minLockedTableNumber) {
          minLockedTableNumber = table.tableNumber;
        }
      }

      // Start numbering from 1, or after locked tables if they occupy low numbers
      let nextTableNumber = 1;

      // Get the set of table numbers occupied by LOCKED tables (these won't change)
      const lockedTableNumbers = new Set<number>();
      for (const table of cache.tables.values()) {
        if (table.locked) {
          lockedTableNumbers.add(table.tableNumber);
        }
      }

      // Collect UNLOCKED tables organized by group in priority order
      const tablesInPriorityOrder: TableData[] = [];
      const tablesInPrioritySet = new Set<string>();

      for (const groupKey of sortedGroupKeys) {
        const groupTables = tablesByGroupKey.get(groupKey) || [];
        // Sort tables within group by their current cluster index, exclude locked tables from renumbering
        const unlockedGroupTables = groupTables.filter(t => !t.locked);
        unlockedGroupTables.sort((a, b) => (a.clusterIndex || 0) - (b.clusterIndex || 0));
        for (const t of unlockedGroupTables) {
          tablesInPriorityOrder.push(t);
          tablesInPrioritySet.add(t._id.toString());
        }
      }

      // Also include any other unlocked tables that weren't in the priority groups
      // (tables that exist but their group wasn't in sortedGroupKeys)
      const otherUnlockedTables: TableData[] = [];
      for (const table of cache.tables.values()) {
        if (!table.locked && !tablesInPrioritySet.has(table._id.toString())) {
          otherUnlockedTables.push(table);
        }
      }
      // Sort other tables by their current number
      otherUnlockedTables.sort((a, b) => a.tableNumber - b.tableNumber);

      // Combine: priority tables first, then other tables
      const allUnlockedTables = [...tablesInPriorityOrder, ...otherUnlockedTables];

      // Renumber ALL unlocked tables
      // Step 1: Move all unlocked tables to temporary negative numbers to avoid conflicts
      let tempNumber = -1;
      for (const table of allUnlockedTables) {
        await Table.findByIdAndUpdate(table._id, { tableNumber: tempNumber });
        table.tableNumber = tempNumber;
        tempNumber--;
      }

      // Step 2: Assign final numbers (skip numbers occupied by locked tables)
      for (const table of allUnlockedTables) {
        // Skip if a locked table occupies this number
        while (lockedTableNumbers.has(nextTableNumber)) {
          nextTableNumber++;
        }

        // Update in database
        await Table.findByIdAndUpdate(table._id, { tableNumber: nextTableNumber });
        // Update in cache
        table.tableNumber = nextTableNumber;
        nextTableNumber++;
      }

      // Update maxTableNumber in cache
      cache.maxTableNumber = Math.max(cache.maxTableNumber, nextTableNumber - 1);
    }

    // ============================================================
    // KIDS TABLE PLACEMENT
    // If we have a kids table, assign children to it first
    // ============================================================
    if (kidsTableId && seatingSettings.enableKidsTable) {
      for (const groupKey of sortedGroupKeys) {
        const groupGuests = guestsByGroup.get(groupKey)!;

        for (const guestUnit of groupGuests) {
          const childrenCount = guestUnit.guest.childrenAttending || 0;
          if (childrenCount > 0) {
            // Check if kids table has space
            const kidsTableOccupied = getOccupiedSeatsFromCache(cache, kidsTableId);
            const kidsTable = cache.tables.get(kidsTableId);
            if (kidsTable) {
              const kidsTableFree = kidsTable.capacity - kidsTableOccupied;
              const childrenToPlace = Math.min(childrenCount, kidsTableFree);

              if (childrenToPlace > 0) {
                // Add children assignment to kids table
                pendingAssignments.push({
                  weddingId,
                  tableId: kidsTableId,
                  guestId: guestUnit.guestId,
                  seatsCount: childrenToPlace,
                  assignmentType: type,
                });

                // Update cache
                addAssignmentToCache(cache, kidsTableId, guestUnit.guestId, childrenToPlace, type);

                // Reduce the seats needed for the main placement (adults only now)
                guestUnit.seatsCount -= childrenToPlace;
                totalAssignments++;
              }
            }
          }
        }
      }
    }

    // ============================================================
    // PROCESS "TOGETHER" PREFERENCES FIRST
    // Handle guests from different groups that need to be together
    // ============================================================
    const processedTogetherGuests = new Set<string>();

    for (const pref of cache.preferences.filter(p => p.type === 'together' && p.enabled)) {
      const guestAId = pref.guestAId.toString();
      const guestBId = pref.guestBId.toString();

      // Skip if both already processed
      if (processedTogetherGuests.has(guestAId) && processedTogetherGuests.has(guestBId)) {
        continue;
      }

      // Find both guests in freeGuests
      const guestA = freeGuests.find(g => g.guestId === guestAId);
      const guestB = freeGuests.find(g => g.guestId === guestBId);

      // Skip if either guest is not free (locked or not confirmed)
      if (!guestA || !guestB) continue;

      // Skip if both guests don't have seats to place
      if (guestA.seatsCount <= 0 && guestB.seatsCount <= 0) continue;

      // Determine which group's tables to use (prefer the one with priority)
      const groupKeyA = guestA.guest.familyGroup ? `family:${guestA.guest.familyGroup}` :
                       guestA.guest.groupId ? `group:${guestA.guest.groupId}` : 'none';
      const groupKeyB = guestB.guest.familyGroup ? `family:${guestB.guest.familyGroup}` :
                       guestB.guest.groupId ? `group:${guestB.guest.groupId}` : 'none';

      // Use 'none' group for cross-group placements (generic tables)
      const targetGroupKey = 'none';
      const targetGroupName = undefined;

      // Place guest A first (if not already processed)
      if (!processedTogetherGuests.has(guestAId) && guestA.seatsCount > 0) {
        const resultA = await placeSeatsForGuestInFamilyGroup(
          weddingId,
          targetGroupKey,
          guestA,
          type,
          seatingSettings.seatsPerTable,
          seatingSettings.adjacencyPolicy,
          targetGroupName,
          cache,
          pendingAssignments,
          tablesByGroupKey,
          seatingSettings.avoidSinglesAlone,
          seatingSettings.enableZonePlacement
        );
        totalAssignments += resultA.assignmentsCreated;
        totalTablesCreated += resultA.tablesCreated;
        allConflicts.push(...resultA.conflicts);
        processedTogetherGuests.add(guestAId);
      }

      // Place guest B immediately after (same or adjacent table)
      if (!processedTogetherGuests.has(guestBId) && guestB.seatsCount > 0) {
        const resultB = await placeSeatsForGuestInFamilyGroup(
          weddingId,
          targetGroupKey,
          guestB,
          type,
          seatingSettings.seatsPerTable,
          seatingSettings.adjacencyPolicy,
          targetGroupName,
          cache,
          pendingAssignments,
          tablesByGroupKey,
          seatingSettings.avoidSinglesAlone,
          seatingSettings.enableZonePlacement
        );
        totalAssignments += resultB.assignmentsCreated;
        totalTablesCreated += resultB.tablesCreated;
        allConflicts.push(...resultB.conflicts);
        processedTogetherGuests.add(guestBId);
      }
    }

    // Process each group (now only placing adults or remaining guests)
    for (const groupKey of sortedGroupKeys) {
      const groupGuests = guestsByGroup.get(groupKey)!;
      const groupName = groupKeyToName.get(groupKey);

      // Sort guests within group - prioritize guests with "together" preferences
      // so they get placed near each other
      groupGuests.sort((a, b) => {
        // First priority: guests with "together" preferences come first
        const aHasTogetherPref = (cache.togetherPreferencesByGuest.get(a.guestId)?.length || 0) > 0;
        const bHasTogetherPref = (cache.togetherPreferencesByGuest.get(b.guestId)?.length || 0) > 0;
        if (aHasTogetherPref && !bHasTogetherPref) return -1;
        if (!aHasTogetherPref && bHasTogetherPref) return 1;

        // Second priority: by creation date
        const dateA = new Date(a.guest.createdAt).getTime();
        const dateB = new Date(b.guest.createdAt).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.guestId.localeCompare(b.guestId);
      });

      // Group together-preference pairs to process consecutively
      const processedIds = new Set<string>();
      const orderedGuests: GuestUnit[] = [];

      for (const guestUnit of groupGuests) {
        if (processedIds.has(guestUnit.guestId)) continue;

        // Add this guest
        orderedGuests.push(guestUnit);
        processedIds.add(guestUnit.guestId);

        // Find and add their "together" partners right after them
        const togetherPrefs = cache.togetherPreferencesByGuest.get(guestUnit.guestId) || [];
        for (const pref of togetherPrefs) {
          const partnerId = pref.guestAId.toString() === guestUnit.guestId
            ? pref.guestBId.toString()
            : pref.guestAId.toString();

          if (!processedIds.has(partnerId)) {
            const partner = groupGuests.find(g => g.guestId === partnerId);
            if (partner) {
              orderedGuests.push(partner);
              processedIds.add(partnerId);
            }
          }
        }
      }

      // Use the reordered list (pairs with "together" preference are consecutive)
      for (const guestUnit of orderedGuests) {
        // Skip if already processed in together-preferences phase
        if (processedTogetherGuests.has(guestUnit.guestId)) continue;

        // Skip if no seats left to place (all children went to kids table)
        if (guestUnit.seatsCount <= 0) continue;

        const result = await placeSeatsForGuestInFamilyGroup(
          weddingId,
          groupKey,
          guestUnit,
          type,
          seatingSettings.seatsPerTable,
          seatingSettings.adjacencyPolicy,
          groupName,
          cache,
          pendingAssignments,
          tablesByGroupKey,
          seatingSettings.avoidSinglesAlone,
          seatingSettings.enableZonePlacement
        );

        totalAssignments += result.assignmentsCreated;
        totalTablesCreated += result.tablesCreated;
        allConflicts.push(...result.conflicts);
      }
    }

    // Bulk insert all assignments at once
    if (pendingAssignments.length > 0) {
      await SeatAssignment.insertMany(pendingAssignments);

      // Update assignedGuests in Table documents for UI compatibility
      // Group assignments by tableId (using Set to avoid duplicates)
      const guestsByTable = new Map<string, Set<string>>();
      for (const assignment of pendingAssignments) {
        if (!guestsByTable.has(assignment.tableId)) {
          guestsByTable.set(assignment.tableId, new Set());
        }
        guestsByTable.get(assignment.tableId)!.add(assignment.guestId);
      }

      // Update each table's assignedGuests array
      const tableUpdatePromises = Array.from(guestsByTable.entries()).map(
        ([tableId, guestIdsSet]) =>
          Table.findByIdAndUpdate(tableId, {
            $addToSet: { assignedGuests: { $each: Array.from(guestIdsSet) } },
          })
      );
      await Promise.all(tableUpdatePromises);
    }

    // ============================================================
    // OVERFLOW HANDLING: Move excess guests to new tables
    // Handle tables where total assigned exceeds capacity
    // ============================================================
    console.log('[OVERFLOW] Starting overflow check...');
    const overflowMoves: Array<{ fromTableId: string; toTableId: string; guestId: string; seatsCount: number }> = [];

    // Build a map of all assignments per table (combining pending with existing from locked guests)
    const assignmentsByTable = new Map<string, Array<{ guestId: string; seatsCount: number; isLocked: boolean }>>();

    // Add pending assignments
    for (const assignment of pendingAssignments) {
      if (!assignmentsByTable.has(assignment.tableId)) {
        assignmentsByTable.set(assignment.tableId, []);
      }
      const guest = cache.guests.get(assignment.guestId);
      const isLocked = guest?.lockedSeat && guest.lockedTableId?.toString() === assignment.tableId;
      assignmentsByTable.get(assignment.tableId)!.push({
        guestId: assignment.guestId,
        seatsCount: assignment.seatsCount,
        isLocked: !!isLocked,
      });
    }

    // Add existing assignments from locked guests (they weren't in pendingAssignments)
    for (const [tableId, assignments] of cache.assignments) {
      if (!assignmentsByTable.has(tableId)) {
        assignmentsByTable.set(tableId, []);
      }
      for (const assignment of assignments) {
        // Only add if not already in pending (locked guests are already in cache)
        const alreadyAdded = assignmentsByTable.get(tableId)!.some(a => a.guestId === assignment.guestId.toString());
        if (!alreadyAdded) {
          const guest = cache.guests.get(assignment.guestId.toString());
          assignmentsByTable.get(tableId)!.push({
            guestId: assignment.guestId.toString(),
            seatsCount: assignment.seatsCount,
            isLocked: !!guest?.lockedSeat,
          });
        }
      }
    }

    console.log(`[OVERFLOW] Checking ${assignmentsByTable.size} tables for overflow`);

    // Check each table for overflow
    for (const [tableId, assignments] of assignmentsByTable) {
      const table = cache.tables.get(tableId);
      if (!table) continue;

      const totalSeats = assignments.reduce((sum, a) => sum + a.seatsCount, 0);
      console.log(`[OVERFLOW] Table ${table.tableName} (${table.tableNumber}): ${totalSeats}/${table.capacity} seats`);

      if (totalSeats > table.capacity) {
        // Table is over capacity - need to move some guests out
        const overflow = totalSeats - table.capacity;
        let seatsToMove = overflow;
        console.log(`[OVERFLOW] Table ${table.tableName} is OVER CAPACITY by ${overflow} seats!`);

        // Sort assignments: non-locked first, then by seatsCount descending (move larger groups first)
        const sortedAssignments = [...assignments].sort((a, b) => {
          if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1; // Non-locked first
          return b.seatsCount - a.seatsCount; // Larger groups first
        });

        console.log(`[OVERFLOW] Sorted assignments:`, sortedAssignments.map(a => ({
          guestId: a.guestId,
          seats: a.seatsCount,
          locked: a.isLocked,
          name: cache.guests.get(a.guestId)?.name
        })));

        for (const assignment of sortedAssignments) {
          if (seatsToMove <= 0) break;
          if (assignment.isLocked) {
            console.log(`[OVERFLOW] Skipping locked guest ${cache.guests.get(assignment.guestId)?.name}`);
            continue;
          }

          // Find or create a new table for overflow
          const guestData = cache.guests.get(assignment.guestId);
          const groupKey = guestData?.familyGroup
            ? `family:${guestData.familyGroup}`
            : 'none';
          const groupName = groupKeyToName.get(groupKey);

          console.log(`[OVERFLOW] Moving guest ${guestData?.name} (${assignment.seatsCount} seats) to new table`);

          // Create overflow table
          const overflowTable = await createGroupTableWithCache(
            weddingId,
            null,
            seatingSettings.seatsPerTable,
            groupName || undefined,
            cache
          );
          totalTablesCreated++;
          console.log(`[OVERFLOW] Created new table: ${overflowTable.tableName} (${overflowTable.tableNumber})`);

          // Move the guest's assignment to the new table
          overflowMoves.push({
            fromTableId: tableId,
            toTableId: overflowTable._id.toString(),
            guestId: assignment.guestId,
            seatsCount: assignment.seatsCount,
          });

          seatsToMove -= assignment.seatsCount;
          console.log(`[OVERFLOW] Remaining seats to move: ${seatsToMove}`);
        }
      }
    }

    console.log(`[OVERFLOW] Total moves to apply: ${overflowMoves.length}`);

    // Apply overflow moves to database
    if (overflowMoves.length > 0) {
      for (const move of overflowMoves) {
        console.log(`[OVERFLOW] Applying move: guest ${move.guestId} from table ${move.fromTableId} to ${move.toTableId}`);

        // Update SeatAssignment - change tableId
        await SeatAssignment.updateOne(
          {
            weddingId,
            tableId: move.fromTableId,
            guestId: move.guestId,
            assignmentType: type,
          },
          { $set: { tableId: move.toTableId } }
        );

        // Update Table.assignedGuests - remove from old, add to new
        await Table.findByIdAndUpdate(move.fromTableId, {
          $pull: { assignedGuests: move.guestId },
        });
        await Table.findByIdAndUpdate(move.toTableId, {
          $addToSet: { assignedGuests: move.guestId },
        });
      }
      console.log(`[OVERFLOW] All moves applied successfully`);
    }

    // ============================================================
    // CLEANUP: Delete empty unlocked tables
    // ============================================================
    // Build set of tables that have guests after overflow moves
    const tablesWithGuestsAfterMoves = new Set<string>();
    for (const assignment of pendingAssignments) {
      // Check if this assignment was moved elsewhere
      const wasMoved = overflowMoves.some(m => m.fromTableId === assignment.tableId && m.guestId === assignment.guestId);
      if (!wasMoved) {
        tablesWithGuestsAfterMoves.add(assignment.tableId);
      }
    }
    // Add destination tables from overflow moves
    for (const move of overflowMoves) {
      tablesWithGuestsAfterMoves.add(move.toTableId);
    }
    // Add tables with locked guests
    for (const [tableId, assignments] of cache.assignments) {
      if (assignments.length > 0) {
        tablesWithGuestsAfterMoves.add(tableId);
      }
    }

    const emptyTableIds: string[] = [];
    for (const tableId of unlockedTableIds) {
      const table = cache.tables.get(tableId);
      // Skip locked tables only
      if (table?.locked) continue;

      // Check if table has any guests after all moves
      if (!tablesWithGuestsAfterMoves.has(tableId)) {
        emptyTableIds.push(tableId);
      }
    }

    if (emptyTableIds.length > 0) {
      // Delete empty tables from database
      await Table.deleteMany({ _id: { $in: emptyTableIds } });
      totalTablesCreated -= emptyTableIds.length; // Adjust count (might go negative if we deleted pre-existing tables)
    }

    // ============================================================
    // VERIFICATION STEP
    // Ensure all free guests got all their seats assigned
    // ============================================================
    const verificationErrors: string[] = [];

    // Check each free guest got all their seats
    for (const guestUnit of freeGuests) {
      const guestAssignments = pendingAssignments.filter(a => a.guestId === guestUnit.guestId);
      const totalSeatsAssigned = guestAssignments.reduce((sum, a) => sum + a.seatsCount, 0);

      // Use the stored originalSeatsCount
      const expectedSeats = guestUnit.originalSeatsCount;

      if (totalSeatsAssigned < expectedSeats) {
        verificationErrors.push(
          `${guestUnit.guest.name}: שובץ ${totalSeatsAssigned}/${expectedSeats} מושבים`
        );

        // Add conflict
        allConflicts.push({
          type: 'no_available_table',
          guestAId: guestUnit.guestId,
          guestAName: guestUnit.guest.name,
          message: `${guestUnit.guest.name} שובץ חלקית - ${totalSeatsAssigned} מתוך ${expectedSeats} מושבים`,
          suggestedAction: 'בדוק שיש מספיק מקום בשולחנות או הוסף שולחנות נוספים',
        });
      }
    }

    if (verificationErrors.length > 0) {
      console.error('[SEATING] Verification failed:', verificationErrors);
    }

    return {
      success: verificationErrors.length === 0,
      assignmentsCreated: totalAssignments,
      tablesCreated: totalTablesCreated,
      conflicts: allConflicts,
    };
  } catch (error) {
    console.error('Auto seating error:', error);
    return {
      success: false,
      assignmentsCreated: 0,
      tablesCreated: 0,
      conflicts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Recalculate seating for a single group (partial recalc)
export async function recalculateGroupSeating(
  weddingId: string,
  groupId: string,
  type: AssignmentType
): Promise<AutoSeatingResult> {
  try {
    const wedding = await Wedding.findById(weddingId).lean() as any;
    if (!wedding) {
      return {
        success: false,
        assignmentsCreated: 0,
        tablesCreated: 0,
        conflicts: [],
        error: 'Wedding not found',
      };
    }

    const seatingSettings: ISeatingSettings = wedding.seatingSettings || {
      mode: 'manual',
      seatsPerTable: 12,
      autoRecalcPolicy: 'onRsvpChangeGroupOnly',
      adjacencyPolicy: 'forbidSameTableOnly',
      simulationEnabled: false,
    };

    // Initialize cache
    const cache = await initializeCache(weddingId, type);

    // Get guests in this group
    const allGuestUnits = await getActiveGuests(weddingId, type);
    const groupGuests = allGuestUnits.filter(
      (unit) =>
        unit.guest.groupId?.toString() === groupId &&
        !unit.guest.lockedSeat &&
        !unit.guest.lockedTableId
    );

    // Get group tables that are not locked
    const groupTableIds: string[] = [];
    for (const [tableId, table] of cache.tables) {
      if (table.groupId?.toString() === groupId && table.mode === 'auto' && !table.locked) {
        groupTableIds.push(tableId);
      }
    }

    // Delete assignments for group tables
    const lockedGuestIds = allGuestUnits
      .filter((u) => u.guest.lockedSeat || u.guest.lockedTableId)
      .map((u) => u.guestId);

    await SeatAssignment.deleteMany({
      weddingId,
      assignmentType: type,
      tableId: { $in: groupTableIds },
      guestId: { $nin: lockedGuestIds },
    });

    // Clear assignedGuests from group tables (keep locked guests)
    if (lockedGuestIds.length > 0) {
      await Table.updateMany(
        { _id: { $in: groupTableIds } },
        { $pull: { assignedGuests: { $nin: lockedGuestIds } } }
      );
    } else {
      await Table.updateMany(
        { _id: { $in: groupTableIds } },
        { $set: { assignedGuests: [] } }
      );
    }

    // Clear from cache
    for (const tableId of groupTableIds) {
      const existing = cache.assignments.get(tableId) || [];
      const kept = existing.filter(a => lockedGuestIds.includes(a.guestId.toString()));
      cache.assignments.set(tableId, kept);
    }

    const group = cache.groups.get(groupId);

    let totalAssignments = 0;
    let totalTablesCreated = 0;
    const allConflicts: SeatingConflict[] = [];
    const pendingAssignments: Array<{ weddingId: string; tableId: string; guestId: string; seatsCount: number; assignmentType: string }> = [];

    groupGuests.sort((a, b) => {
      const dateA = new Date(a.guest.createdAt).getTime();
      const dateB = new Date(b.guest.createdAt).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.guestId.localeCompare(b.guestId);
    });

    for (const guestUnit of groupGuests) {
      const result = await placeSeatsForGuestOptimized(
        weddingId,
        groupId,
        guestUnit,
        type,
        seatingSettings.seatsPerTable,
        seatingSettings.adjacencyPolicy,
        group?.name,
        cache,
        pendingAssignments,
        seatingSettings.avoidSinglesAlone ?? true,
        seatingSettings.enableZonePlacement ?? false
      );

      totalAssignments += result.assignmentsCreated;
      totalTablesCreated += result.tablesCreated;
      allConflicts.push(...result.conflicts);
    }

    // Bulk insert
    if (pendingAssignments.length > 0) {
      await SeatAssignment.insertMany(pendingAssignments);

      // Update assignedGuests in Table documents for UI compatibility
      const guestsByTable = new Map<string, string[]>();
      for (const assignment of pendingAssignments) {
        if (!guestsByTable.has(assignment.tableId)) {
          guestsByTable.set(assignment.tableId, []);
        }
        guestsByTable.get(assignment.tableId)!.push(assignment.guestId);
      }

      const tableUpdatePromises = Array.from(guestsByTable.entries()).map(
        ([tableId, guestIds]) =>
          Table.findByIdAndUpdate(tableId, {
            $addToSet: { assignedGuests: { $each: guestIds } },
          })
      );
      await Promise.all(tableUpdatePromises);
    }

    return {
      success: true,
      assignmentsCreated: totalAssignments,
      tablesCreated: totalTablesCreated,
      conflicts: allConflicts,
    };
  } catch (error) {
    console.error('Group seating recalc error:', error);
    return {
      success: false,
      assignmentsCreated: 0,
      tablesCreated: 0,
      conflicts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get seating summary for display (optimized)
export async function getSeatingAssignments(
  weddingId: string,
  type: AssignmentType
): Promise<Array<{
  tableId: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  groupName?: string;
  assignments: Array<{
    guestId: string;
    guestName: string;
    seatsCount: number;
    isSplit: boolean;
  }>;
  occupiedSeats: number;
  freeSeats: number;
}>> {
  // Load all data in parallel
  const [tables, assignments, groups, guests] = await Promise.all([
    Table.find({ weddingId }).sort({ tableNumber: 1 }).lean() as unknown as Promise<TableData[]>,
    SeatAssignment.find({ weddingId, assignmentType: type }).lean() as unknown as Promise<AssignmentData[]>,
    GuestGroup.find({ weddingId }).lean() as unknown as Promise<GroupData[]>,
    Guest.find({ weddingId }).lean() as unknown as Promise<GuestData[]>,
  ]);

  // Index data
  const groupMap = new Map(groups.map((g) => [g._id.toString(), g]));
  const guestMap = new Map(guests.map((g) => [g._id.toString(), g]));

  // Index assignments by table
  const assignmentsByTable = new Map<string, AssignmentData[]>();
  const totalAssignmentsPerGuest = new Map<string, number>();

  for (const a of assignments) {
    const tableId = a.tableId.toString();
    const guestId = a.guestId.toString();

    if (!assignmentsByTable.has(tableId)) {
      assignmentsByTable.set(tableId, []);
    }
    assignmentsByTable.get(tableId)!.push(a);

    totalAssignmentsPerGuest.set(guestId, (totalAssignmentsPerGuest.get(guestId) || 0) + 1);
  }

  // Build result
  return tables.map((table) => {
    const tableId = table._id.toString();
    const tableAssignments = assignmentsByTable.get(tableId) || [];

    const assignmentDetails = tableAssignments.map((a) => {
      const guestId = a.guestId.toString();
      const guest = guestMap.get(guestId);
      return {
        guestId,
        guestName: guest?.name || 'Unknown',
        seatsCount: a.seatsCount,
        isSplit: (totalAssignmentsPerGuest.get(guestId) || 0) > 1,
      };
    });

    const occupiedSeats = tableAssignments.reduce((sum, a) => sum + a.seatsCount, 0);
    const group = table.groupId ? groupMap.get(table.groupId.toString()) : null;

    return {
      tableId,
      tableName: table.tableName,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      groupName: group?.name,
      assignments: assignmentDetails,
      occupiedSeats,
      freeSeats: table.capacity - occupiedSeats,
    };
  });
}

// Legacy exports for backward compatibility
export async function getAutoTablesForGroup(
  weddingId: string,
  groupId: string | null,
  type: AssignmentType
): Promise<TableData[]> {
  const query: any = {
    weddingId,
    mode: 'auto',
  };
  if (groupId) {
    query.groupId = groupId;
  }

  return await Table.find(query)
    .sort({ clusterIndex: 1, _id: 1 })
    .lean() as unknown as TableData[];
}

export async function getOccupiedSeats(
  tableId: string,
  type: AssignmentType
): Promise<number> {
  const assignments = await SeatAssignment.find({
    tableId,
    assignmentType: type,
  }).lean() as unknown as AssignmentData[];

  return assignments.reduce((sum, a) => sum + a.seatsCount, 0);
}

export async function getFreeSeats(
  table: TableData,
  type: AssignmentType
): Promise<number> {
  const occupied = await getOccupiedSeats(table._id.toString(), type);
  return table.capacity - occupied;
}

export async function createGroupTable(
  weddingId: string,
  groupId: string | null,
  seatsPerTable: number,
  groupName?: string
): Promise<TableData> {
  const existingTables = await Table.find({
    weddingId,
    groupId: groupId || null,
    mode: 'auto',
  }).lean() as unknown as TableData[];

  const maxClusterIndex = existingTables.reduce(
    (max, t) => Math.max(max, t.clusterIndex || 0),
    0
  );

  const allTables = await Table.find({ weddingId }).lean() as unknown as TableData[];
  const maxTableNumber = allTables.reduce((max, t) => Math.max(max, t.tableNumber), 0);

  const newTable = await Table.create({
    weddingId,
    tableName: groupName
      ? `${groupName} ${maxClusterIndex + 1}`
      : `שולחן ${maxTableNumber + 1}`,
    tableNumber: maxTableNumber + 1,
    capacity: seatsPerTable,
    tableType: 'mixed',
    mode: 'auto',
    groupId: groupId || undefined,
    clusterIndex: maxClusterIndex + 1,
    locked: false,
  });

  return newTable.toObject() as unknown as TableData;
}
