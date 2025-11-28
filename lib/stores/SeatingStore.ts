import { makeAutoObservable, runInAction } from 'mobx';
import type {
  GuestGroup,
  SeatingPreference,
  SeatingSettings,
  SeatingConflict,
  AutoSeatingResult,
  SeatingAssignment,
} from './types';
import type { RootStore } from './RootStore';

export class SeatingStore {
  rootStore: RootStore;

  // Settings
  settings: SeatingSettings = {
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
  };

  // Groups
  groups: GuestGroup[] = [];

  // Preferences
  preferences: SeatingPreference[] = [];

  // Auto seating assignments
  assignments: SeatingAssignment[] = [];
  simulationAssignments: SeatingAssignment[] = [];

  // Conflicts
  conflicts: SeatingConflict[] = [];

  // Loading states
  loadingSettings = false;
  loadingGroups = false;
  loadingPreferences = false;
  runningAutoSeating = false;

  // Loaded flags
  isSettingsLoaded = false;
  isGroupsLoaded = false;
  isPreferencesLoaded = false;
  isAssignmentsLoaded = false;

  // View mode
  viewMode: 'real' | 'simulation' = 'real';

  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get weddingId() {
    return this.rootStore.weddingId;
  }

  get isAutoMode() {
    return this.settings.mode === 'auto';
  }

  get currentAssignments() {
    return this.viewMode === 'simulation' ? this.simulationAssignments : this.assignments;
  }

  // Load seating settings
  async loadSettings(forceReload = false) {
    if (!this.weddingId) return;
    if (this.isSettingsLoaded && !forceReload) return;

    this.loadingSettings = true;
    this.error = null;

    try {
      const response = await fetch(`/api/seating/settings?weddingId=${this.weddingId}`);
      const data = await response.json();

      if (response.ok) {
        runInAction(() => {
          this.settings = data.settings;
          this.loadingSettings = false;
          this.isSettingsLoaded = true;
        });
      } else {
        throw new Error(data.error || 'Failed to load settings');
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loadingSettings = false;
      });
    }
  }

  // Update seating settings
  async updateSettings(newSettings: Partial<SeatingSettings>) {
    if (!this.weddingId) return { success: false, error: 'No wedding ID' };

    try {
      const response = await fetch('/api/seating/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: this.weddingId,
          settings: newSettings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      runInAction(() => {
        // Merge settings instead of replacing to maintain MobX reactivity
        Object.assign(this.settings, data.settings);
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Load groups
  async loadGroups(forceReload = false) {
    if (!this.weddingId) return;
    if (this.isGroupsLoaded && !forceReload) return;

    this.loadingGroups = true;
    this.error = null;

    try {
      const response = await fetch(`/api/seating/groups?weddingId=${this.weddingId}`);
      const data = await response.json();

      if (response.ok) {
        runInAction(() => {
          this.groups = data.groups;
          this.loadingGroups = false;
          this.isGroupsLoaded = true;
        });
      } else {
        throw new Error(data.error || 'Failed to load groups');
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loadingGroups = false;
      });
    }
  }

  // Create group
  async createGroup(name: string, priority = 0) {
    if (!this.weddingId) return { success: false, error: 'No wedding ID' };

    try {
      const response = await fetch('/api/seating/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: this.weddingId,
          name,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create group');
      }

      runInAction(() => {
        this.groups.push(data.group);
      });

      return { success: true, group: data.group };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update group
  async updateGroup(groupId: string, updates: { name?: string; priority?: number }) {
    try {
      const response = await fetch('/api/seating/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, ...updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update group');
      }

      runInAction(() => {
        const index = this.groups.findIndex((g) => g._id === groupId);
        if (index !== -1) {
          this.groups[index] = { ...this.groups[index], ...updates };
        }
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete group
  async deleteGroup(groupId: string) {
    try {
      const response = await fetch(`/api/seating/groups?groupId=${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete group');
      }

      runInAction(() => {
        this.groups = this.groups.filter((g) => g._id !== groupId);
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Load preferences
  async loadPreferences(forceReload = false) {
    if (!this.weddingId) return;
    if (this.isPreferencesLoaded && !forceReload) return;

    this.loadingPreferences = true;
    this.error = null;

    try {
      const response = await fetch(`/api/seating/preferences?weddingId=${this.weddingId}`);
      const data = await response.json();

      if (response.ok) {
        runInAction(() => {
          this.preferences = data.preferences;
          this.loadingPreferences = false;
          this.isPreferencesLoaded = true;
        });
      } else {
        throw new Error(data.error || 'Failed to load preferences');
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loadingPreferences = false;
      });
    }
  }

  // Create preference
  async createPreference(
    guestAId: string,
    guestBId: string,
    type: 'together' | 'apart',
    scope: 'sameTable' | 'adjacentTables' = 'sameTable',
    strength?: 'must' | 'try'
  ) {
    if (!this.weddingId) return { success: false, error: 'No wedding ID' };

    try {
      const response = await fetch('/api/seating/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: this.weddingId,
          guestAId,
          guestBId,
          type,
          scope,
          strength,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create preference');
      }

      runInAction(() => {
        this.preferences.push(data.preference);
      });

      return { success: true, preference: data.preference };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete preference
  async deletePreference(preferenceId: string) {
    try {
      const response = await fetch(`/api/seating/preferences?preferenceId=${preferenceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete preference');
      }

      runInAction(() => {
        this.preferences = this.preferences.filter((p) => p._id !== preferenceId);
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Run auto seating
  async runAutoSeating(type: 'real' | 'simulation' = 'real', groupId?: string): Promise<AutoSeatingResult> {
    if (!this.weddingId) {
      return {
        success: false,
        assignmentsCreated: 0,
        tablesCreated: 0,
        conflicts: [],
        error: 'No wedding ID',
      };
    }

    this.runningAutoSeating = true;
    this.error = null;

    try {
      const response = await fetch('/api/seating/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: this.weddingId,
          type,
          groupId,
        }),
      });

      const data = await response.json();

      runInAction(() => {
        this.runningAutoSeating = false;
        if (data.conflicts) {
          this.conflicts = data.conflicts;
        }
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run auto seating');
      }

      // Reload assignments after running (force reload since we just created new ones)
      await this.loadAssignments(type, true);

      // Also reload tables to see new ones (force reload)
      await this.rootStore.tablesStore.loadTables(true);

      return data as AutoSeatingResult;
    } catch (error: any) {
      runInAction(() => {
        this.runningAutoSeating = false;
        this.error = error.message;
      });
      return {
        success: false,
        assignmentsCreated: 0,
        tablesCreated: 0,
        conflicts: [],
        error: error.message,
      };
    }
  }

  // Load assignments
  async loadAssignments(type: 'real' | 'simulation' = 'real', forceReload = false) {
    if (!this.weddingId) return;
    if (type === 'real' && this.isAssignmentsLoaded && !forceReload) return;

    try {
      const response = await fetch(`/api/seating/auto?weddingId=${this.weddingId}&type=${type}`);
      const data = await response.json();

      if (response.ok) {
        runInAction(() => {
          if (type === 'simulation') {
            this.simulationAssignments = data.assignments;
          } else {
            this.assignments = data.assignments;
            this.isAssignmentsLoaded = true;
          }
        });
      }
    } catch (error: any) {
      console.error('Error loading assignments:', error);
    }
  }

  // Toggle view mode
  setViewMode(mode: 'real' | 'simulation') {
    this.viewMode = mode;
    if (mode === 'simulation' && this.simulationAssignments.length === 0) {
      this.loadAssignments('simulation');
    }
  }

  // Load all seating data
  async loadAll() {
    await Promise.all([
      this.loadSettings(),
      this.loadGroups(),
      this.loadPreferences(),
      this.loadAssignments('real'),
    ]);

    if (this.settings.simulationEnabled) {
      await this.loadAssignments('simulation');
    }
  }

  // Reset store
  reset() {
    this.settings = {
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
    };
    this.groups = [];
    this.preferences = [];
    this.assignments = [];
    this.simulationAssignments = [];
    this.conflicts = [];
    this.loadingSettings = false;
    this.loadingGroups = false;
    this.loadingPreferences = false;
    this.runningAutoSeating = false;
    this.isSettingsLoaded = false;
    this.isGroupsLoaded = false;
    this.isPreferencesLoaded = false;
    this.isAssignmentsLoaded = false;
    this.viewMode = 'real';
    this.error = null;
  }
}
