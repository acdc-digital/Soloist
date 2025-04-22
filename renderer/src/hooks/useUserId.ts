// USER-ID HOOK
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/hooks/useUserId.ts

import { useEffect } from 'react';
import { useUser } from './useUser'; // Your existing hook from Convex
import { useUserStore } from '@/store/userStore'; // Your Zustand store
import { jwtDecode } from 'jwt-decode';
import { useAuthToken } from '@convex-dev/auth/react';

/**
 * A hook to consistently get and manage user ID across the application
 * - Syncs ID from Convex auth to Zustand store
 * - Provides consistent access to userId for components
 * - Handles both authenticated and unauthenticated states
 */
export function useUserId() {
  // 1. Get user data from your Convex hook
  const { user, isSignedIn, isLoaded } = useUser();
  
  // 2. Get user from Zustand store
  const storeUser = useUserStore((state) => state.user);
  const setStoreUser = useUserStore((state) => state.setUser);
  
  // 3. Get raw token to ensure we have the auth ID
  const token = useAuthToken();
  
  // Extract userId from token (most reliable source)
  let authId: string | null = null;
  if (token) {
    try {
      const decoded = jwtDecode<{ sub: string }>(token);
      authId = decoded.sub;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }
  
  // Sync Convex user to store when available
  useEffect(() => {
    if (user && user._id) {
      // If we have a user document from Convex, use that ID
      setStoreUser({
        id: user._id.toString(),
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.imageUrl || user.image
      });
      console.log("useUserId: Synced Convex user ID to store:", user._id.toString());
    } else if (authId && !storeUser?.id) {
      // If we only have auth ID but no store user, set minimal user
      setStoreUser({
        id: authId,
        name: "",
        email: "",
        profilePicture: ""
      });
      console.log("useUserId: Set auth ID to store:", authId);
    }
  }, [user, authId, storeUser?.id, setStoreUser]);

  // Return values in order of reliability
  return {
    // The user ID, in order of reliability:
    // 1. Convex user document ID
    // 2. Auth token sub claim
    // 3. Zustand store ID
    // 4. Empty string as last resort (never undefined)
    userId: user?._id?.toString() || authId || storeUser?.id || "",
    
    // Additional helpful states
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
    user: user || storeUser,
  };
}