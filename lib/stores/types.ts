// Shared types for stores

export interface Table {
  _id: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  tableType: 'adults' | 'kids' | 'mixed';
  assignedGuests: Guest[];
}

export interface Guest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  familyGroup?: string;
  invitedCount: number;
  uniqueToken: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  adultsAttending?: number;
  childrenAttending?: number;
  specialMealRequests?: string;
  notes?: string;
  tableAssignment?: string;
  tableNumber?: number;
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
