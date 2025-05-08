// USER CONTEXT PROVIDER
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/provider/userContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useUserId } from "@/hooks/useUserId";
import { useUpsertUser } from "@/hooks/useUser";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// A strongly‑typed user object we pass around the app
interface AppUser {
  id: string;
  authId?: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// Define the shape of our context
interface UserContextType {
  userId: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AppUser | null;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  userId: "",
  isLoading: true,
  isAuthenticated: false,
  user: null,
});

// Provider component that wraps parts of your app that need user data
export function UserProvider({ children }: { children: ReactNode }) {
  // Use our enhanced userId hook
  const { userId, isLoading, isAuthenticated, user: authUser } = useUserId();

  // Zustand selectors
  const storeUser     = useUserStore((s) => s.user);
  const storeLoading  = useUserStore((s) => s.isLoading);
  const setLoading    = useUserStore((s) => s.setLoading);
  const syncUserWithConvex = useUserStore((s) => s.syncUserWithConvex);
  const setAuthStatus     = useUserStore((s) => s.setAuthStatus);

  // Ensure user document is created/updated
  useUpsertUser(authUser?.name, authUser?.email, authUser?.image);

  // Get the user from Convex
  const convexUser = useQuery(api.users.viewer);

  // Kick the store into loading state on first mount
  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  // Update Zustand store when auth status changes
  useEffect(() => {
    setAuthStatus({ isAuthenticated, isLoading: storeLoading });
  }, [isAuthenticated, storeLoading, setAuthStatus]);

  // Sync user data from Convex to Zustand when it changes
  useEffect(() => {
    if (convexUser) {
      syncUserWithConvex(convexUser); // syncUserWithConvex already sets isLoading false
    }
  }, [convexUser, syncUserWithConvex]);

  // Log when user ID changes (for debugging)
  useEffect(() => {
    if (userId) {
      console.log("UserProvider - User ID available:", userId);
    }
  }, [userId]);

  // Value object that will be provided to consumers
  const value = {
    userId,
    isLoading: storeLoading,
    isAuthenticated,
    user: storeUser, // single source of truth
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}