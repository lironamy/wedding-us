import { makeAutoObservable } from 'mobx';
import { TablesStore } from './TablesStore';
import { GuestsStore } from './GuestsStore';

export class RootStore {
  tablesStore: TablesStore;
  guestsStore: GuestsStore;
  weddingId: string | null = null;

  constructor() {
    this.tablesStore = new TablesStore(this);
    this.guestsStore = new GuestsStore(this);
    makeAutoObservable(this);
  }

  // Set wedding ID and load all data
  async setWeddingId(weddingId: string) {
    this.weddingId = weddingId;
    await this.loadAllData();
  }

  // Load all stores data
  async loadAllData() {
    await Promise.all([
      this.guestsStore.loadGuests(),
      this.tablesStore.loadTables(),
    ]);
  }

  // Reset all stores
  reset() {
    this.weddingId = null;
    this.tablesStore.reset();
    this.guestsStore.reset();
  }
}

// Create singleton instance
export const rootStore = new RootStore();
