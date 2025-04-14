// LEFT SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/sidebar.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";
import {
  AppWindow,
  Search,
  Plus,
  Settings,
  LogOut,
  Moon,
  Sun,
  ArrowRightToLine,
  ArrowLeftFromLine,
  PersonStanding,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useFeedStore } from "@/store/feedStore";

interface SidebarProps {
  className?: string;
}

// Example actions
const handleCreateNewLog = () => {
  // Access feed store actions
  const { setSidebarOpen, setSelectedDate, setActiveTab } = useFeedStore.getState();

  // Build today's date key
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  // Update the feed store
  setSelectedDate(dateKey);  // Set the current day
  setActiveTab("log");       // Ensure we're on the log tab
  setSidebarOpen(true);      // Open the right sidebar
};

const handleGoToSettings = () => console.log("Trigger Settings action");
const handleSoloist = () => {
  console.log("Soloist action clicked");
};

export function Sidebar({ className }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const user = useUserStore((state) => state.user);
  const signOut = useUserStore((state) => state.signOut);

  const {
    collapsed,
    toggleCollapsed,
    searchQuery,
    setSearchQuery,
  } = useSidebarStore();

  const [isHovering, setIsHovering] = React.useState(false);

  // Items that show only if expanded
  const mainActions = [
    { id: "soloist", label: "Soloist", icon: PersonStanding, action: handleSoloist },
    { id: "new-log", label: "Create New Log", icon: Plus, action: handleCreateNewLog },
    { id: "settings", label: "Settings", icon: Settings, action: handleGoToSettings },
  ];

  const handleSignOut = () => {
    signOut();
    console.log("User signed out");
  };

  return (
    <div className={cn("relative h-screen", className)}>
      {/* SIDEBAR CONTAINER */}
      <div
        className={cn(
          "flex flex-col justify-between h-full border-r border-zinc-300/30 bg-white dark:border-zinc-700/30 dark:bg-zinc-950/40",
          "backdrop-blur-xl overflow-hidden transition-[width] duration-300 ease-in-out",
          collapsed ? "w-13" : "w-64"
        )}
      >
        {/* TOP SECTION */}
        <div className="relative p-2">
          {/* AppWindow icon at the top. Always visible. Clicking it toggles sidebar. */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={cn(
              "rounded-md",
              "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isHovering ? (
              collapsed ? (
                <ArrowRightToLine className="h-4 w-4" />
              ) : (
                <ArrowLeftFromLine className="h-4 w-4" />
              )
            ) : (
              <AppWindow className="h-4 w-4" />
            )}
          </Button>

          {/* Everything below is hidden if collapsed */}
          {!collapsed && (
            <div className="mt-4 space-y-3">
              {/* SEARCH */}
              <div>
                <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Search
                </p>
                <div className="relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400"
                  />
                  <Input
                    placeholder="Search"
                    className="h-9 pl-8 bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-300/60 dark:border-zinc-700/60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search"
                  />
                </div>
              </div>

              <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40 -mx-2" />

              {/* ACTIONS */}
              <div>
                <p className="px-2 mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Actions
                </p>
                {mainActions.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={item.action}
                    className="w-full h-9 justify-start px-3 text-sm font-normal hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg mb-1"
                    aria-label={item.label}
                  >
                    <item.icon
                      size={16}
                      className="mr-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0"
                    />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM SECTION */}
        <div className="relative p-2">
          {/* Hide everything if collapsed */}
          {!collapsed && (
            <>
              <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40 -mx-2" />

              {/* THEME SWITCH */}
              <div className="mt-3">
                <p className="px-2 mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Preferences
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full h-9 justify-start px-3 text-sm font-normal hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg"
                  aria-label={`Switch to ${
                    theme === "dark" ? "light" : "dark"
                  } mode`}
                >
                  {theme === "dark" ? (
                    <Sun
                      size={16}
                      className="mr-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0"
                    />
                  ) : (
                    <Moon
                      size={16}
                      className="mr-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0"
                    />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
              </div>

              <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40 -mx-2 mt-3" />

              {/* ACCOUNT DROPDOWN */}
              <div className="mt-3 mb-12">
                <p className="px-2 mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Account
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full py-1.5 px-2 flex items-center justify-start text-left rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                      aria-label="Account options"
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
                      <div className="ml-2.5 overflow-hidden">
                        <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {user?.name || "User Name"}
                        </p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={8}
                    className="w-56 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-300/50 dark:border-zinc-700/50 rounded-lg shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-zinc-500 dark:text-zinc-400 px-2 pt-1.5 pb-1 font-medium">
                      My Account
                    </DropdownMenuLabel>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;