// USER OBJECT DETAILS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/utils/objectEquals.ts

export function shallowEqual<T extends Record<string, any>>(a: T | null, b: T | null) {
    if (a === b) return true;
    if (!a || !b) return false;
    return Object.keys(a).every(k => a[k] === b[k]);
  }