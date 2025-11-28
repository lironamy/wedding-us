// Shared types for stores

export interface Table {
  _id: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  tableType: 'adults' | 'kids' | 'mixed';
  assignedGuests: Guest[];
  // Auto seating fields
  mode: 'auto' | 'manual';
  groupId?: string;
  clusterIndex?: number;
  positionX?: number;
  positionY?: number;
  locked: boolean;
  // Hall zone placement
  zone?: 'stage' | 'dance' | 'quiet' | 'general';
  // Visual settings for hall canvas
  shape?: 'round' | 'square' | 'rectangle';
  size?: 'small' | 'medium' | 'large';
}

export interface Guest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  familyGroup?: string;
  groupId?: string;
  invitedCount: number;
  expectedPartySize?: number;
  uniqueToken: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  adultsAttending?: number;
  childrenAttending?: number;
  specialMealRequests?: string;
  notes?: string;
  tableAssignment?: string;
  tableNumber?: number;
  lockedSeat?: boolean;
  lockedTableId?: string;
}

export interface GuestGroup {
  _id: string;
  name: string;
  priority?: number;
  guestCount: number;
  confirmedCount: number;
}

export interface SeatingPreference {
  _id: string;
  guestAId: string;
  guestBId: string;
  guestAName: string;
  guestBName: string;
  type: 'together' | 'apart';
  scope: 'sameTable' | 'adjacentTables';
  strength: 'must' | 'try';
  enabled: boolean;
}

export interface SeatingSettings {
  mode: 'auto' | 'manual';
  seatsPerTable: number;
  autoRecalcPolicy: 'onRsvpChangeGroupOnly' | 'onRsvpChangeAll' | 'manualOnly';
  adjacencyPolicy: 'forbidSameTableOnly' | 'forbidSameAndAdjacent';
  simulationEnabled: boolean;
  // Kids table settings
  enableKidsTable?: boolean;
  kidsTableMinAge?: number;
  kidsTableMinCount?: number;
  // Singles placement
  avoidSinglesAlone?: boolean;
  // Hall zones
  enableZonePlacement?: boolean;
}

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

export interface SeatingAssignment {
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
}

export interface TableStatistics {
  totalTables: number;
  totalCapacity: number;
  totalAssignedPeople: number;
  totalConfirmedPeople: number;
  unassignedGuestsCount: number;
  unassignedPeople: number;
  seatingProgress: number;
  capacityUsage: number;
  tablesByType: {
    adults: number;
    kids: number;
    mixed: number;
  };
  tablesOverCapacity: number;
}

export interface Gift {
  guestId: string;
  name: string;
  phone: string;
  amount: number;
  method: string;
  rsvpStatus: string;
  date: string;
}

export interface GiftStatistics {
  totalGifts: number;
  guestsWithGifts: number;
  totalGuests: number;
  confirmedGuests: number;
  giftsByMethod: {
    bit: number;
    paybox: number;
  };
  averageGift: number;
  giftRate: number;
}
