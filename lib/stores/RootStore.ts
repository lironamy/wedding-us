import { makeAutoObservable } from 'mobx';
import { TablesStore } from './TablesStore';
import { GuestsStore } from './GuestsStore';
import { SeatingStore } from './SeatingStore';

export class RootStore {
  tablesStore: TablesStore;
  guestsStore: GuestsStore;
  seatingStore: SeatingStore;
  weddingId: string | null = null;

  constructor() {
    this.tablesStore = new TablesStore(this);
    this.guestsStore = new GuestsStore(this);
    this.seatingStore = new SeatingStore(this);
    makeAutoObservable(this);
  }

  // Set wedding ID and load all data (only if changed)
  async setWeddingId(weddingId: string) {
    // Skip if already loaded for this wedding
    if (this.weddingId === weddingId && this.isDataLoaded) {
      return;
    }

    this.weddingId = weddingId;
    await this.loadAllData();
    this.isDataLoaded = true;
  }

  isDataLoaded = false;

  // Load all stores data
  async loadAllData() {
    await Promise.all([
      this.guestsStore.loadGuests(),
      this.tablesStore.loadTables(),
      this.seatingStore.loadAll(),
    ]);
  }

  // Reset all stores
  reset() {
    this.weddingId = null;
    this.isDataLoaded = false;
    this.tablesStore.reset();
    this.guestsStore.reset();
    this.seatingStore.reset();
  }
}

// Create singleton instance
export const rootStore = new RootStore();
