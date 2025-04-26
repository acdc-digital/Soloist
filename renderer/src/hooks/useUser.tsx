// useUSER
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/hooks/useUser.tsx

import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { jwtDecode } from "jwt-decode";
import { api } from "../../convex/_generated/api";
import { useEffect, useCallback } from "react";
import { getStableAuthId } from "@/utils/authId";

interface DecodedToken {
  sub: string;
}

export function useUser() {
  const token = useAuthToken();
  let userId: string | null = null;

  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      userId = decoded.sub;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  // When no user is signed in, skip the query to avoid errors
  const user = useQuery(api.users.getUser, userId ? { id: userId } : "skip");
  // Get the upsertion mutation
  const upsertUser = useMutation(api.users.upsertUser);
  
  // Callback to ensure user document exists
  const ensureUserDocument = useCallback(async (name?: string, email?: string, image?: string) => {
    if (!userId) return null;
    
    try {
      const result = await upsertUser({ 
        authId: userId, 
        name, 
        email, 
        image 
      });
      return result;
    } catch (err) {
      console.error("Failed to upsert user:", err);
      return null;
    }
  }, [userId, upsertUser]);

  return {
    user,
    isSignedIn: Boolean(userId),
    isLoaded: token !== undefined, // More accurate, handles loading state
    userId: userId || "", // Always return a string (never null)
    ensureUserDocument, // Expose method to manually trigger user creation/update
  };
}

// Separate hook for upserting the user with auto-trigger
export function useUpsertUser(name?: string, email?: string, image?: string) {
  const { userId, ensureUserDocument } = useUser();

  useEffect(() => {
    if (userId) {
      ensureUserDocument(name, email, image);
    }
  }, [userId, name, email, image, ensureUserDocument]);

  return { ensureUserDocument };
}