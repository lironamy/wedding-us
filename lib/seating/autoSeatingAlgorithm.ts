import Guest from '@/lib/db/models/Guest';
import Table from '@/lib/db/models/Table';
import GuestGroup from '@/lib/db/models/GuestGroup';
import SeatAssignment from '@/lib/db/models/SeatAssignment';
import SeatingPreference from '@/lib/db/models/SeatingPreference';
import TableAdjacency from '@/lib/db/models/TableAdjacency';
import Wedding, { ISeatingSettings } from '@/lib/db/models/Wedding';

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
  createdAt: Date;
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
  maxTableNumber: number;
  maxClusterIndexByGroup: Map<string | null, number>;
}

// Initialize cache with all data loaded upfront
async function initializeCache(weddingId: string, type: AssignmentType): Promise<SeatingCache> {
  // Load all data in parallel
  const [tables, assignments, preferences, adjacencies, groups, guests] = await Promise.all([
    Table.find({ weddingId }).lean() as unknown as Promise<TableData[]>,
    SeatAssignment.find({ weddingId, assignmentType: type }).lean() as unknown as Promise<AssignmentData[]>,
    SeatingPreference.find({ weddingId, enabled: true }).lean() as unknown as Promise<PreferenceData[]>,
    TableAdjacency.find({ weddingId }).lean() as unknown as Promise<any[]>,
    GuestGroup.find({ weddingId }).lean() as unknown as Promise<GroupData[]>,
    Guest.find({ weddingId }).lean() as unknown as Promise<GuestData[]>,
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
    maxTableNumber: 0,
    maxClusterIndexByGroup: new Map(),
  };

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
  adjacencyPolicy: 'forbidSameTableOnly' | 'forbidSameAndAdjacent'
): { canPlace: boolean; conflictWith?: string } {
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
      score += 100 * multiplier;
    } else if (guestsAtAdjacentTables.has(otherGuestId)) {
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
      seatsCount = (guest.adultsAttending || 0) + (guest.childrenAttending || 0);
    } else {
      if (guest.rsvpStatus === 'confirmed') {
        seatsCount = (guest.adultsAttending || 0) + (guest.childrenAttending || 0);
      } else {
        seatsCount = guest.expectedPartySize || guest.invitedCount || 1;
      }
    }
    return {
      guestId: guest._id.toString(),
      guest,
      seatsCount: Math.max(1, seatsCount),
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

// Place seats for a guest in family group (supports both groupId and familyGroup)
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
  tablesByGroupKey: Map<string, TableData[]>
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

  while (seatsNeeded > 0) {
    // Find tables with space from this group's tables
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

      const canPlace = canPlaceGuestAtTableFromCache(cache, guestUnit.guestId, tableId, adjacencyPolicy);

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

    // Sort by score, free seats
    tablesWithSpace.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.freeSeats - a.freeSeats;
    });

    let targetTable: TableData;
    let freeSeats: number;

    if (tablesWithSpace.length > 0) {
      targetTable = tablesWithSpace[0].table;
      freeSeats = tablesWithSpace[0].freeSeats;
    } else {
      // Create new table for this group
      const nextTableNumber = cache.maxTableNumber + 1;
      const tableIndex = groupTables.length + 1;

      const newTable = await Table.create({
        weddingId,
        tableName: groupName
          ? `${groupName} ${tableIndex}`
          : `שולחן ${nextTableNumber}`,
        tableNumber: nextTableNumber,
        capacity: seatsPerTable,
        tableType: 'mixed',
        mode: 'auto',
        locked: false,
      });

      targetTable = newTable.toObject() as unknown as TableData;

      // Update cache
      addTableToCache(cache, targetTable);
      groupTables.push(targetTable);

      freeSeats = seatsPerTable;
      tablesCreated++;
    }

    const seatsToPlace = Math.min(freeSeats, seatsNeeded);
    const tableId = targetTable._id.toString();

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
  pendingAssignments: Array<{ weddingId: string; tableId: string; guestId: string; seatsCount: number; assignmentType: string }>
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

      const canPlace = canPlaceGuestAtTableFromCache(cache, guestUnit.guestId, tableId, adjacencyPolicy);

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

    // Sort by score, free seats, cluster index
    tablesWithSpace.sort((a, b) => {
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

    const seatingSettings: ISeatingSettings = wedding.seatingSettings || {
      mode: 'manual',
      seatsPerTable: 12,
      autoRecalcPolicy: 'onRsvpChangeGroupOnly',
      adjacencyPolicy: 'forbidSameTableOnly',
      simulationEnabled: false,
    };

    // Initialize cache with all data
    const cache = await initializeCache(weddingId, type);

    // Get active guests
    const guestUnits = await getActiveGuests(weddingId, type);

    // Separate locked and free guests
    const lockedGuests = guestUnits.filter(
      (unit) => unit.guest.lockedSeat || unit.guest.lockedTableId
    );
    const freeGuests = guestUnits.filter(
      (unit) => !unit.guest.lockedSeat && !unit.guest.lockedTableId
    );

    // Get auto tables that are not locked
    const lockedGuestIds = lockedGuests.map((g) => g.guestId);
    const autoTableIds: string[] = [];

    for (const [tableId, table] of cache.tables) {
      if (table.mode === 'auto' && !table.locked) {
        autoTableIds.push(tableId);
      }
    }

    // Delete existing assignments (single bulk operation)
    await SeatAssignment.deleteMany({
      weddingId,
      assignmentType: type,
      tableId: { $in: autoTableIds },
      guestId: { $nin: lockedGuestIds },
    });

    // Clear assignedGuests from auto tables (keep locked guests)
    if (lockedGuestIds.length > 0) {
      await Table.updateMany(
        { _id: { $in: autoTableIds } },
        { $pull: { assignedGuests: { $nin: lockedGuestIds } } }
      );
    } else {
      await Table.updateMany(
        { _id: { $in: autoTableIds } },
        { $set: { assignedGuests: [] } }
      );
    }

    // Clear assignments from cache for auto tables
    for (const tableId of autoTableIds) {
      const existing = cache.assignments.get(tableId) || [];
      const kept = existing.filter(a => lockedGuestIds.includes(a.guestId.toString()));
      cache.assignments.set(tableId, kept);
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

    // Sort groups - prioritize groups with names, then alphabetically
    const sortedGroupKeys = Array.from(guestsByGroup.keys()).sort((a, b) => {
      if (a === 'none') return 1;
      if (b === 'none') return -1;
      const nameA = groupKeyToName.get(a) || '';
      const nameB = groupKeyToName.get(b) || '';
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
    // 2. table name matching group name
    // 3. Generic tables (like "שולחן 1") go to 'none' group
    for (const [tableId, table] of cache.tables) {
      // Skip locked tables
      if (table.locked) continue;

      let matchedGroupKey: string | null = null;

      // Check if table has a groupId reference
      if (table.groupId) {
        matchedGroupKey = `group:${table.groupId.toString()}`;
      } else {
        // Try to match table name to group names
        // Tables created for familyGroups are named like "משפחת כהן 1", "משפחת כהן 2"
        for (const [groupKey, groupName] of groupKeyToName.entries()) {
          // Check if table name starts with the group name
          if (groupName && table.tableName.startsWith(groupName)) {
            matchedGroupKey = groupKey;
            break;
          }
        }

        // If no group match found, check if it's a generic table (for 'none' group)
        // Generic tables are named like "שולחן 1", "שולחן 2", etc.
        if (!matchedGroupKey && table.tableName.startsWith('שולחן')) {
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

    // Process each group
    for (const groupKey of sortedGroupKeys) {
      const groupGuests = guestsByGroup.get(groupKey)!;
      const groupName = groupKeyToName.get(groupKey);

      // Sort guests within group
      groupGuests.sort((a, b) => {
        const dateA = new Date(a.guest.createdAt).getTime();
        const dateB = new Date(b.guest.createdAt).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.guestId.localeCompare(b.guestId);
      });

      for (const guestUnit of groupGuests) {
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
          tablesByGroupKey
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
      // Group assignments by tableId
      const guestsByTable = new Map<string, string[]>();
      for (const assignment of pendingAssignments) {
        if (!guestsByTable.has(assignment.tableId)) {
          guestsByTable.set(assignment.tableId, []);
        }
        guestsByTable.get(assignment.tableId)!.push(assignment.guestId);
      }

      // Update each table's assignedGuests array
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
        pendingAssignments
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
