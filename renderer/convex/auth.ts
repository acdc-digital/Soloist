// CONVEX AUTH.TS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/convex/auth.ts

import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub],
});
