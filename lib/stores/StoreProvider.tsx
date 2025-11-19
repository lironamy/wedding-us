'use client';

import { createContext, useContext, useEffect } from 'react';
import { RootStore, rootStore } from './RootStore';

const StoreContext = createContext<RootStore | null>(null);

interface StoreProviderProps {
  children: React.ReactNode;
  weddingId?: string;
}

export function StoreProvider({ children, weddingId }: StoreProviderProps) {
  useEffect(() => {
    if (weddingId) {
      rootStore.setWeddingId(weddingId);
    }

    return () => {
      // Reset on unmount if needed
    };
  }, [weddingId]);

  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use stores
export function useStores() {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStores must be used within StoreProvider');
  }
  return store;
}

// Individual store hooks for convenience
export function useTablesStore() {
  return useStores().tablesStore;
}

export function useGuestsStore() {
  return useStores().guestsStore;
}

// Export rootStore for direct access when needed
export { rootStore };
