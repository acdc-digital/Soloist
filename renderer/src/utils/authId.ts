// AUTH ID UTILS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/utils/authId.ts

export function getStableAuthId(tokenSub?: string): string | null {
    if (!tokenSub) return null;
    return tokenSub.split("|")[0] || null;   // keep only the left side
  }