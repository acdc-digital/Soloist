// useUSER
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/hooks/useUser.tsx

// renderer/src/hooks/useUser.tsx
import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo } from "react";

import { api } from "../../convex/_generated/api";
import { getStableAuthId } from "@/utils/authId";

interface TokenClaims {
  sub: string;
  name?: string;
  email?: string;
  picture?: string; // GitHub avatar URL
}

export function useUser() {
  /* ───────────────── 1. Get the JWT from Convex Auth ─────────────── */
  const token = useAuthToken();                // undefined while loading

  /* ───────────────── 2. Decode it (memoised) ─────────────────────── */
  const { authId, tokenName, tokenEmail, tokenAvatar } = useMemo(() => {
    if (!token) {
      return { authId: null, tokenName: "", tokenEmail: "", tokenAvatar: "" };
    }
    try {
      const c = jwtDecode<TokenClaims>(token);
      return {
        authId: getStableAuthId(c.sub),
        tokenName:  c.name    ?? "",
        tokenEmail: c.email   ?? "",
        tokenAvatar: c.picture ?? "",
      };
    } catch (err) {
      console.error("jwtDecode failed:", err);
      return { authId: null, tokenName: "", tokenEmail: "", tokenAvatar: "" };
    }
  }, [token]);

  /* ───────────────── 3. Fetch our user row (skip until authId) ───── */
  const user = useQuery(
    api.users.getUser,
    authId ? { id: authId } : "skip"
  );

  /* ───────────────── 4. Upsert helper ────────────────────────────── */
  const upsertUser = useMutation(api.users.upsertUser);

  const ensureUserDocument = useCallback(
    async () => {
      if (!authId) return; // safety
      try {
        await upsertUser({
          authId,
          name:  tokenName,
          email: tokenEmail,
          image: tokenAvatar,
        });
      } catch (err) {
        console.error("upsertUser failed:", err);
      }
    },
    [authId, tokenName, tokenEmail, tokenAvatar, upsertUser]
  );

  /* ───────────────── 5. Run the upsert exactly once per authId ───── */
  useEffect(() => {
    if (authId) {
      // fire-and-forget
      void ensureUserDocument();
    }
  }, [authId, ensureUserDocument]);

  /* ───────────────── 6. Public API ───────────────────────────────── */
  return {
    user,                    // Convex document (may be undefined while loading)
    isSignedIn: !!authId,
    isLoaded: token !== undefined,
    userId: authId ?? "",

    // expose these in case other hooks want them
    tokenName,
    tokenEmail,
    tokenAvatar,

    // expose manual helper (rarely needed now)
    ensureUserDocument,
  };
}

/* ───────────────── 7. Auto-upsert helper (kept for compatibility) ─ */
export function useUpsertUser(
  name?: string,
  email?: string,
  image?: string
) {
  const { userId, ensureUserDocument } = useUser();

  useEffect(() => {
    if (userId) ensureUserDocument();
  }, [userId, ensureUserDocument]);

  return { ensureUserDocument };
}