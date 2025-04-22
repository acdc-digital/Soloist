// USER UTILS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/utils/userUtils.ts

<<<<<<< HEAD
/**
 * Safely extracts the user ID from various user object formats
 * Works with both Convex user objects (_id) and Zustand store user objects (id)
 */
export function getUserId(user: any): string {
    if (!user) return '';
    
    // First try _id (from Convex)
    if (user._id) {
      return typeof user._id === 'object' ? user._id.toString() : user._id;
    }
    
    // Then try id (from store)
    if (user.id) {
      return user.id;
    }
    
    return '';
  }
=======
// src/utils/userUtils.ts

/**
 * Gets a valid user ID string from various possible user objects
 * This is a fallback utility for components that don't use the hook
 * Ideally, components should use the `useUserId` hook directly
 * 
 * @param user User object from Convex, store, or other source
 * @returns A string ID (empty string if no ID found)
 */
export function getUserId(user: any): string {
  if (!user) return "";
  
  // Handle Convex user documents
  if (user._id) {
    return user._id.toString();
  }
  
  // Handle user store objects
  if (user.id) {
    return user.id;
  }
  
  // Handle auth ID directly
  if (user.authId) {
    return user.authId;
  }
  
  // Return empty string as fallback
  return "";
}

/**
 * Determines if a user ID is valid
 * @param userId User ID to check
 * @returns boolean indicating if ID is valid
 */
export function isValidUserId(userId: string | undefined | null): boolean {
  return Boolean(userId && userId.trim() !== "");
}
>>>>>>> 56bd30b (Updated Authentication Flow)
