// USER UTILS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/utils/userUtils.ts

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
