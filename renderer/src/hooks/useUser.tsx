// useUSER
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/hooks/useUser.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // This should be available in most Convex auth versions
  const authActions = useAuthActions();

  useEffect(() => {
    // Function to get user data or check authentication state
    async function getUserData() {
      try {
        // Attempt to call a method that might exist on authActions
        // This is based on common Convex auth patterns
        if (typeof authActions?.getUserIdentity === 'function') {
          const userData = await authActions.getUserIdentity();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } 
        // Alternative method name
        else if (typeof authActions?.getSession === 'function') {
          const session = await authActions.getSession();
          if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
        // Direct property access as fallback
        else if (authActions?.user) {
          setUser(authActions.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error getting user data:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    getUserData();
    
    // Check if there's a observable auth state, and subscribe if possible
    if (typeof authActions?.onAuthChange === 'function') {
      const unsubscribe = authActions.onAuthChange((newState) => {
        if (newState?.user) {
          setUser(newState.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      });
      
      return unsubscribe;
    }
  }, [authActions]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}