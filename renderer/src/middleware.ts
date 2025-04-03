// Middleware.ts
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/middleware.ts

import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
  } from "@convex-dev/auth/nextjs/server";
  
  const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
  
  export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
    // If it's a protected route and the user is not logged in, redirect:
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
  });
  
  export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
    // The default excludes static files, _next, etc.
  };