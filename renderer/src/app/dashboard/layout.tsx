// DASHBOARD LAYOUT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/layout.tsx

"use client";

import React, { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";

// Import our enhanced hooks
import { useUser, useUpsertUser } from "@/hooks/useUser";
import { useUserId } from "@/hooks/useUserId";
import DraggableHeader from "./_components/DraggableHeader";

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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - fixed height */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
        <DraggableHeader />
      </div>

      {/* Main content area - takes remaining height */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
