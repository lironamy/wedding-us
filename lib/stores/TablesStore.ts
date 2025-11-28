import { makeAutoObservable, runInAction } from 'mobx';
import type { Table, Guest, TableStatistics } from './types';
import type { RootStore } from './RootStore';

export class TablesStore {
  rootStore: RootStore;
  tables: Table[] = [];
  statistics: TableStatistics | null = null;
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

  // Computed: unassigned guests (guests not in any table)
  get unassignedGuests(): Guest[] {
    const assignedIds = new Set(
      this.tables.flatMap((t) => t.assignedGuests.map((g) => g._id))
    );
    return this.rootStore.guestsStore.confirmedGuests.filter(
      (g) => !assignedIds.has(g._id)
    );
  }

  // Load tables and statistics (skip if already loaded)
  // silent = true: update data in background without showing loading state
  async loadTables(forceReload = false, silent = false) {
    if (!this.weddingId) return;
    if (this.isLoaded && !forceReload) return;

    // Only show loading spinner on initial load, not on silent refreshes
    if (!silent) {
      this.loading = true;
    }
    this.error = null;

    try {
      const [tablesRes, statsRes] = await Promise.all([
        fetch(`/api/tables?weddingId=${this.weddingId}`),
        fetch(`/api/tables/statistics?weddingId=${this.weddingId}`),
      ]);

      const tablesData = await tablesRes.json();
      const statsData = await statsRes.json();

      runInAction(() => {
        if (tablesRes.ok) {
          this.tables = tablesData.tables || [];
        }
        if (statsRes.ok) {
          this.statistics = statsData.statistics;
        }
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

  // Create a new table
  async createTable(tableData: {
    tableName: string;
    tableNumber: number;
    capacity: number;
    tableType: 'adults' | 'kids' | 'mixed';
  }) {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: this.weddingId,
          ...tableData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      runInAction(() => {
        this.tables.push(data.table);
        this.updateStatistics();
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update a table
  async updateTable(tableId: string, tableData: {
    tableName: string;
    tableNumber: number;
    capacity: number;
    tableType: 'adults' | 'kids' | 'mixed';
  }): Promise<{
    success: boolean;
    error?: string;
    conflict?: {
      tableId: string;
      tableName: string;
      tableNumber: number;
      guestsCount: number;
    };
  }> {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for conflict (status 409)
        if (response.status === 409 && data.conflict) {
          return { success: false, error: data.error, conflict: data.conflict };
        }
        throw new Error(data.error || 'Failed to update table');
      }

      runInAction(() => {
        const index = this.tables.findIndex((t) => t._id === tableId);
        if (index !== -1) {
          this.tables[index] = { ...this.tables[index], ...tableData };
        }
        this.updateStatistics();
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update table position (for event hall canvas)
  async updateTablePosition(tableId: string, positionX: number, positionY: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/tables/${tableId}/position`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionX, positionY }),
      });

      if (!response.ok) {
        console.error('Failed to save table position');
        return false;
      }

      runInAction(() => {
        const index = this.tables.findIndex((t) => t._id === tableId);
        if (index !== -1) {
          this.tables[index] = { ...this.tables[index], positionX, positionY };
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to save table position:', error);
      return false;
    }
  }

  // Update table visual settings (shape and size)
  async updateTableVisual(tableId: string, shape?: 'round' | 'square' | 'rectangle', size?: 'small' | 'medium' | 'large'): Promise<boolean> {
    try {
      const response = await fetch(`/api/tables/${tableId}/visual`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shape, size }),
      });

      if (!response.ok) {
        console.error('Failed to save table visual settings');
        return false;
      }

      runInAction(() => {
        const index = this.tables.findIndex((t) => t._id === tableId);
        if (index !== -1) {
          if (shape) this.tables[index].shape = shape;
          if (size) this.tables[index].size = size;
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to save table visual settings:', error);
      return false;
    }
  }

  // Delete a table
  async deleteTable(tableId: string) {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete table');
      }

      // Reload tables silently to get updated numbers (server renumbers tables after deletion)
      await this.loadTables(true, true);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Assign guest to table
  async assignGuest(guestId: string, tableId: string) {
    try {
      const response = await fetch(`/api/tables/${tableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: [guestId],
          action: 'add',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign guest');
      }

      // Reload tables silently to get updated data with correct seat counts
      await this.loadTables(true, true);

      return {
        success: true,
        isOverCapacity: data.isOverCapacity,
        message: data.message
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Remove guest from table
  async removeGuest(guestId: string, tableId: string) {
    try {
      const response = await fetch(`/api/tables/${tableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: [guestId],
          action: 'remove',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove guest');
      }

      // Reload tables silently to get updated data with correct seat counts
      await this.loadTables(true, true);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update statistics locally (called after mutations)
  private async updateStatistics() {
    if (!this.weddingId) return;

    try {
      const response = await fetch(`/api/tables/statistics?weddingId=${this.weddingId}`);
      const data = await response.json();

      if (response.ok) {
        runInAction(() => {
          this.statistics = data.statistics;
        });
      }
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  // Helper: get people count at table
  getPeopleAtTable(table: Table): number {
    return table.assignedGuests.reduce((sum, guest) => {
      return sum + (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
    }, 0);
  }

  // Swap two tables (numbers only)
  async swapTables(tableAId: string, tableBId: string) {
    try {
      const response = await fetch('/api/tables/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableAId, tableBId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to swap tables');
      }

      // Update local state with swapped tables
      runInAction(() => {
        for (const updatedTable of data.tables) {
          const index = this.tables.findIndex((t) => t._id === updatedTable._id);
          if (index !== -1) {
            this.tables[index] = updatedTable;
          }
        }
        // Re-sort tables by table number
        this.tables.sort((a, b) => a.tableNumber - b.tableNumber);
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Reset store
  reset() {
    this.tables = [];
    this.statistics = null;
    this.loading = false;
    this.error = null;
    this.isLoaded = false;
  }
}
