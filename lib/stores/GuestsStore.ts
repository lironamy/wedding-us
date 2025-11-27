import { makeAutoObservable, runInAction } from 'mobx';
import type { Guest } from './types';
import type { RootStore } from './RootStore';

export class GuestsStore {
  rootStore: RootStore;
  guests: Guest[] = [];
  loading = false;
  error: string | null = null;
  isLoaded = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get weddingId() {
    return this.rootStore.weddingId;
  }

  // Computed: confirmed guests
  get confirmedGuests(): Guest[] {
    return this.guests.filter((g) => g.rsvpStatus === 'confirmed');
  }

  // Computed: pending guests
  get pendingGuests(): Guest[] {
    return this.guests.filter((g) => g.rsvpStatus === 'pending');
  }

  // Computed: declined guests
  get declinedGuests(): Guest[] {
    return this.guests.filter((g) => g.rsvpStatus === 'declined');
  }

  // Computed: statistics
  get statistics() {
    return {
      total: this.guests.length,
      confirmed: this.confirmedGuests.length,
      declined: this.declinedGuests.length,
      pending: this.pendingGuests.length,
      totalAdults: this.guests.reduce((sum, g) => sum + (g.adultsAttending || 0), 0),
      totalChildren: this.guests.reduce((sum, g) => sum + (g.childrenAttending || 0), 0),
    };
  }

  // Computed: unique family groups
  get familyGroups(): string[] {
    return Array.from(
      new Set(this.guests.filter((g) => g.familyGroup).map((g) => g.familyGroup!))
    ).sort();
  }

  // Load guests (skip if already loaded)
  async loadGuests(forceReload = false) {
    if (!this.weddingId) return;
    if (this.isLoaded && !forceReload) return;

    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/guests?weddingId=${this.weddingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load guests');
      }

      runInAction(() => {
        this.guests = data.guests || [];
        this.loading = false;
        this.isLoaded = true;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }

  // Add a guest
  async addGuest(guestData: Partial<Guest>) {
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: this.weddingId,
          ...guestData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add guest');
      }

      runInAction(() => {
        this.guests.push(data.guest);
      });

      return { success: true, guest: data.guest };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update a guest
  async updateGuest(guestId: string, guestData: Partial<Guest>) {
    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update guest');
      }

      runInAction(() => {
        const index = this.guests.findIndex((g) => g._id === guestId);
        if (index !== -1) {
          this.guests[index] = { ...this.guests[index], ...guestData };
        }
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete a guest
  async deleteGuest(guestId: string) {
    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      runInAction(() => {
        this.guests = this.guests.filter((g) => g._id !== guestId);
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get guest by ID
  getGuestById(guestId: string): Guest | undefined {
    return this.guests.find((g) => g._id === guestId);
  }

  // Reset store
  reset() {
    this.guests = [];
    this.loading = false;
    this.error = null;
    this.isLoaded = false;
  }
}
