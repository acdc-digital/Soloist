// ZUSTAND USER STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/userStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  // Add other user properties you want to track
  lastSyncedAt?: number;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  signOut: () => void;
  setAuthStatus: (status: { isAuthenticated: boolean; isLoading: boolean }) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      // Set entire user object
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        // Add lastSyncedAt timestamp when user is set
        ...(user ? { user: { ...user, lastSyncedAt: Date.now() } } : {})
      }),
      
      // Update selected fields on existing user
      updateUser: (updates) => set((state) => {
        if (!state.user) return state;
        return { 
          user: { 
            ...state.user, 
            ...updates,
            lastSyncedAt: Date.now()
          } 
        };
      }),
      
      // Sign out - clear user
      signOut: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      }),
      
      // Set authentication status without changing user
      setAuthStatus: ({ isAuthenticated, isLoading }) => 
        set((state) => ({
          isAuthenticated,
          isLoading,
          // Clear user if setting to unauthenticated
          ...(isAuthenticated === false ? { user: null } : {})
        }))
    }),
    {
      name: 'user-storage',
      
      // Custom merge strategy for persisted data
      merge: (persisted: any, current: UserState) => {
        // If there's persisted user data but auth says we're not authenticated,
        // ignore the persisted user
        if (persisted.user && current.isAuthenticated === false) {
          return {
            ...current,
            user: null,
            isLoading: false
          };
        }
        
        return {
          ...current,
          ...persisted,
          // Keep isLoading from current state
          isLoading: current.isLoading
        };
      }
    }
  )
);
