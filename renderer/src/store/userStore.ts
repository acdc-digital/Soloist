// ZUSTAND USER STORE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/store/userStore.ts

// /src/store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string; // Keep this for backward compatibility
  image?: string;          // Add this to match Convex schema
  lastSyncedAt?: number;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  signOut: () => void;
  setLoading: (isLoading: boolean) => void;
  setAuthStatus: (status: { isAuthenticated: boolean; isLoading: boolean }) => void;
  syncUserWithConvex: (convexUser: any) => void; // Add this method
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      // Set entire user object
      setUser: (user) =>
        set({
          user: user ? { ...user, lastSyncedAt: Date.now() } : null,
          isAuthenticated: !!user,
          isLoading: false,
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
        isLoading: true
      }),

      // Explicitly toggle the loading state
      setLoading: (isLoading) => set({ isLoading }),
      
      // Set authentication status without changing user
      setAuthStatus: ({ isAuthenticated, isLoading }) => 
        set((state) => ({
          isAuthenticated,
          isLoading,
          // Clear user if setting to unauthenticated
          ...(isAuthenticated === false ? { user: null } : {})
        })),

      // New method to sync user data from Convex
      syncUserWithConvex: (convexUser) => set((state) => {
        if (!convexUser) return state;

        // If we don't have a user yet, create one
        if (!state.user) {
          return {
            user: {
              id: convexUser._id?.toString() || convexUser.id || '',
              name: convexUser.name || '',
              email: convexUser.email || '',
              profilePicture: convexUser.image || '',
              image: convexUser.image || '',
              lastSyncedAt: Date.now()
            },
            isAuthenticated: true,
            isLoading: false
          };
        }
        
        // Otherwise update existing user
        return {
          user: {
            ...state.user,
            name: convexUser.name || state.user.name,
            email: convexUser.email || state.user.email,
            profilePicture: convexUser.image || state.user.profilePicture,
            image: convexUser.image || state.user.image,
            lastSyncedAt: Date.now()
          },
          isLoading: false
        };
      })
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
