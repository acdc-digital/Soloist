// SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/sidebar.tsx

"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, 
  Plus,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";
import React from "react";

// SidebarItem definition
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action?: () => void;
  href?: string;
}

interface SidebarProps {
  className?: string;
}

// Reminder: For backdrop-blur to see *through* the window,
// Electron BrowserWindow needs { transparent: true } configuration.
export function Sidebar({ className }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const user = useUserStore((state) => state.user);
  const signOut = useUserStore((state) => state.signOut);
  const { collapsed, toggleCollapsed, searchQuery, setSearchQuery } = useSidebarStore();

  // Mock functions
  const handleCreateNewLog = () => console.log("Trigger Create New Log action");
  const handleGoToSettings = () => console.log("Trigger Settings action");
  const handleSignOut = () => {
    signOut();
    console.log("User signed out");
  };

  // Define sidebar action items (Dashboard removed)
  const mainActions: SidebarItem[] = [
    { id: 'new-log', label: 'Create New Log', icon: Plus, action: handleCreateNewLog },
    { id: 'settings', label: 'Settings', icon: Settings, action: handleGoToSettings },
  ];

  // Helper component for sidebar buttons
  const SidebarButton = ({ item }: { item: SidebarItem }) => (
    <Button
      variant="ghost"
      onClick={item.action}
      className={cn(
        "h-9 w-full justify-start px-3 text-sm font-normal hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg"
      )}
      aria-label={item.label}
    >
      <item.icon size={16} className="mr-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0" /> {/* Added flex-shrink-0 */}
      <span className="truncate">{item.label}</span>
    </Button>
  );

  // Helper for Section Titles
  const SectionTitle = ({ title }: { title: string }) => (
    <p className="px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
      {title}
    </p>
  );

  return (
    // Wrapper for positioning the absolute toggle button
    <div className={cn("relative h-screen", className)}>

      {/* The actual sidebar content that collapses */}
      <div
        className={cn(
          "flex h-full flex-col justify-between border-r border-zinc-300/30 bg-zinc-50/40 dark:border-zinc-700/30 dark:bg-zinc-950/40 backdrop-blur-xl",
          "transition-[width] duration-300 ease-in-out overflow-hidden",
          collapsed ? "w-0 border-none" : "w-64",
          className
        )}
        aria-hidden={collapsed}
      >
        {/* Top Section: Search, Actions - Parent has p-2 */}
        <div className="flex flex-col space-y-3 p-2 pt-4">

          {/* Search Section */}
          <div className="space-y-1.5">
            <SectionTitle title="Search" />
            <div className="relative px-1"> {/* Inner padding for alignment */}
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400 pointer-events-none" // Added pointer-events-none
              />
              <Input
                placeholder="Search..."
                className="h-9 rounded-lg pl-8 text-sm bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-300/60 dark:border-zinc-700/60 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                tabIndex={collapsed ? -1 : 0}
                aria-label="Search" // Added aria-label
              />
            </div>
          </div>

          {/* Separator spanning full width (uses negative margin to counteract parent p-2) */}
          <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40 my-2 mx-[-0.5rem]" />

          {/* Actions Section */}
          <div className="space-y-1">
            <SectionTitle title="Actions" />
            {mainActions.map((item) => (
              <SidebarButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Bottom Section: Theme, User - Parent has p-2 */}
        <div className="flex flex-col space-y-2 p-2 pb-3">

          {/* Separator spanning full width (uses negative margin to counteract parent p-2) */}
          <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40 mx-[-0.5rem]" />

          {/* Preferences Section */}
          <div className="space-y-1">
             <SectionTitle title="Preferences" />
            {/* Theme Toggle */}
              <Button
                variant="ghost"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "h-9 w-full justify-start px-3 text-sm font-normal hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg"
                )}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === "dark" ? (
                  <Sun size={16} className="mr-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                ) : (
                  <Moon size={16} className="mr-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                )}
                 <span className="truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </Button>
          </div>

           {/* Separator spanning full width (uses negative margin to counteract parent p-2) */}
           <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40 mx-[-0.5rem]" />

          {/* Account Section */}
          <div className="space-y-1.5">
             <SectionTitle title="Account" />
             {/* User Dropdown */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full h-auto py-1.5 px-2 flex items-center justify-start text-left",
                            "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg",
                            "disabled:opacity-50 disabled:pointer-events-none",
                            collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
                            "transition-opacity duration-100 ease-in-out"
                        )}
                        disabled={collapsed}
                        aria-label="Account options"
                        tabIndex={collapsed ? -1 : 0}
                    >
                        <Avatar className="h-7 w-7 flex-shrink-0 ring-1 ring-offset-1 ring-offset-zinc-50/60 dark:ring-offset-zinc-950/60 ring-zinc-300/50 dark:ring-zinc-700/50">
                            <AvatarImage
                                src={user?.profilePicture || ""}
                                alt={user?.name || "User Avatar"}
                            />
                            <AvatarFallback className="bg-zinc-200 text-zinc-700 text-[10px] dark:bg-zinc-800 dark:text-zinc-300 font-medium">
                                {user?.name?.substring(0, 1)?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        {/* Text container */}
                        <div className="ml-2.5 flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-zinc-800 dark:text-zinc-200">
                                {user?.name || "User Name"}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                {user?.email || "user@example.com"}
                            </p>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                {/* Dropdown Content */}
                 <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={8}
                    className="w-56 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-300/50 dark:border-zinc-700/50 rounded-lg shadow-lg"
                >
                    <DropdownMenuLabel className="text-xs text-zinc-500 dark:text-zinc-400 px-2 pt-1.5 pb-1 font-medium">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-300/40 dark:bg-zinc-700/40 mx-1" />
                    <DropdownMenuItem className="text-sm font-normal focus:bg-zinc-200/60 dark:focus:bg-zinc-800/60 cursor-pointer mx-1 rounded-md">
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm font-normal focus:bg-zinc-200/60 dark:focus:bg-zinc-800/60 cursor-pointer mx-1 rounded-md">
                        <Settings className="mr-2 h-4 w-4 text-zinc-500" />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-300/40 dark:bg-zinc-700/40 mx-1" />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-sm font-normal focus:bg-red-100/60 dark:focus:bg-red-900/40 text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 cursor-pointer mx-1 rounded-md"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </div> {/* End of collapsing sidebar content */}

      {/* --- Absolutely Positioned Elements --- */}

      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-3 z-50 h-7 w-7 rounded-full",
          "bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60",
          "backdrop-blur-sm border border-zinc-300/30 dark:border-zinc-700/30",
          "transition-all duration-300 ease-in-out",
          collapsed ? "left-2" : "left-[236px]", // Position based on collapsed state
          "focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-0"
        )}
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={15} className="text-zinc-500" />
         ) : (
          <ChevronLeft size={15} className="text-zinc-500" />
         )}
      </Button>

      {/* 
          COLLAPSED SEARCH BUTTON REMOVED 
      */}

    </div> // End of wrapper div
  );
}

export default Sidebar;