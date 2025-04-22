// DASHBOARD LAYOUT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/layout.tsx

"use client";

import React, { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";

// Import our enhanced hooks
import { useUser, useUpsertUser } from "@/hooks/useUser";
import { useUserId } from "@/hooks/useUserId";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Get user data from our custom hook that provides consistent user ID
  const { userId, isAuthenticated: hasUserId } = useUserId();
  
  // Use basic useUser to get the Convex user document
  const { user } = useUser();
  
  // Ensures that a user doc exists and is updated whenever auth state changes
  useUpsertUser(user?.name, user?.email, user?.image);
  
  // Log userId to verify it's working
  useEffect(() => {
    console.log("DashboardLayout - User ID:", userId);
    console.log("DashboardLayout - Is Authenticated:", hasUserId);
  }, [userId, hasUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-sm">Loading...</p>
      </div>
    );
  }

  // If not authenticated at the session level, redirect to home page
  if (!isAuthenticated) {
    return redirect("/");
  }

  // Once authenticated, render the dashboard layout children
  return (
    <div className="dashboard-content">
      {children}
    </div>
  );
};

export default DashboardLayout;
