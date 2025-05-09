// LEFT SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/sidebar.tsx

"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";
import {
  Search,
  Plus,
  Settings,
  ArrowRightToLine,
  ArrowLeftFromLine,
  PersonStanding,
  Activity,
  CircleHelpIcon,
  ChevronUp,
  ChevronDown,
  User,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import Stores & Modals
import { SettingsDialog } from "@/app/settings/SettingsDialog";
import { useFeedStore } from "@/store/feedStore";
import { useUserContext } from "@/provider/userContext";
// Import SignOut component
import { SignOutWithGitHub } from "@/auth/oath/SignOutWithGitHub";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  // Get user from both sources to ensure we have the most up-to-date info
  const storeUser = useUserStore((state) => state.user);
  const { user: contextUser } = useUserContext();  // Get user from context
  
  // State for accordion
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  
  // Merge user data, preferring contextUser if available
  const user = React.useMemo(() => {
    if (!storeUser && !contextUser) return null;
    
    return {
      ...storeUser,
      ...contextUser,
      // Ensure we map the image property correctly
      profilePicture: contextUser?.image || storeUser?.profilePicture,
      name: contextUser?.name || storeUser?.name,
      email: contextUser?.email || storeUser?.email,
    };
  }, [storeUser, contextUser]);
  
  // Update Zustand store if context user changes and differs from store
  React.useEffect(() => {
    const updateUser = useUserStore.getState().updateUser;
    if (contextUser && storeUser && (
        contextUser.image !== storeUser.profilePicture || 
        contextUser.name !== storeUser.name || 
        contextUser.email !== storeUser.email
      )) {
      updateUser({
        profilePicture: contextUser.image,
        name: contextUser.name,
        email: contextUser.email
      });
    }
  }, [contextUser, storeUser]);
  
  const { 
    collapsed, 
    toggleCollapsed, 
    searchQuery, 
    setSearchQuery,
    currentView,
    setView
  } = useSidebarStore();
  
  // State to control the SettingsDialog
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  
  // Handlers
  const handleGoToSettings = () => {
    setIsSettingsOpen(true);
  };
  
  const handleCreateNewLog = () => {
    const {
      sidebarOpen,
      activeTab,
      resetFeed,
      setSidebarOpen,
      setSelectedDate,
      setActiveTab,
    } = useFeedStore.getState();
    // Set view to dashboard when creating a new log
    setView("dashboard");
    // If it's already open on "log", close it
    if (sidebarOpen && activeTab === "log") {
      setSidebarOpen(false);
      resetFeed(); // optional if you want to clear the feed on close
      return;
    }
    // Otherwise, open and reset the "log" tab
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateKey = `${yyyy}-${mm}-${dd}`;
    resetFeed();
    setSelectedDate(dateKey);
    setActiveTab("log");
    setSidebarOpen(true);
  };
  
  const handleSoloist = () => {
    // Switch to Soloist view
    setView("soloist");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Soloist action clicked");
  };

  const handleTesting = () => {
    // Switch to Testing view
    setView("testing");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Testing action clicked");
  };

  const handleCalendar = () => {
    // Switch to Dashboard/Calendar view
    setView("dashboard");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Calendar action clicked");
  };
  
  const handleGoTohelp = () => {
    // Switch to Help view
    setView("help");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Help action clicked");
  };
  
  const handleProfileClick = () => {
    console.log("Profile clicked");
    setAccountMenuOpen(false);
  };
  
  const handleSettingsClick = () => {
    handleGoToSettings();
    setAccountMenuOpen(false);
  };
  
  // Items that show only if expanded
  const mainActions = [
    { id: "soloist",  label: "Soloist",        icon: PersonStanding,  action: handleSoloist, active: currentView === "soloist" },
    { id: "testing",  label: "Playground",     icon: Activity,        action: handleTesting, active: currentView === "testing" },
    { id: "calendar", label: "Calendar",       icon: Calendar,        action: handleCalendar, active: currentView === "dashboard" },
    { id: "new-log",  label: "Create New Log", icon: Plus,            action: handleCreateNewLog, active: false },
    { id: "settings", label: "Settings",       icon: Settings,        action: handleGoToSettings },
    { id: "help",     label: "Help",           icon: CircleHelpIcon,  action: handleGoTohelp },
  ];
  
  // Get user initials for avatar fallback
  const userInitials = React.useMemo(() => {
    if (!user?.name) return "U";
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].substring(0, 1).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }, [user?.name]);
  
  return (
    <div className={cn("relative h-screen", className)}>
      <div
        className={cn(
          "flex flex-col justify-between h-full border-r border-zinc-300/30 bg-white dark:border-zinc-700/30 dark:bg-zinc-950/40",
          "backdrop-blur-xl overflow-hidden transition-[width] duration-300 ease-in-out",
          collapsed ? "w-13" : "w-64"
        )}
      >
        {/* TOP SECTION */}
        <div className="relative">
          {/* Toggle Sidebar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 m-2"
          >
            {collapsed ? (
              <ArrowRightToLine className="h-4 w-4" />
            ) : (
              <ArrowLeftFromLine className="h-4 w-4" />
            )}
          </Button>
          {/* Everything below is hidden if collapsed */}
          {!collapsed && (
            <div className="mt-1 space-y-3">
              {/* SEARCH */}
              <div>
                <p className="px-1 pl-3 pr-2 p-2 mb-0 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Search
                </p>
                <div className="relative pl-2 pr-4">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <Input
                    placeholder="Search"
                    className="h-9 pl-8 bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-300/60 dark:border-zinc-700/60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40" />
              {/* ACTIONS */}
              <div>
                <p className="px-2 pl-3 p-2 mb-0 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Actions
                </p>
                {mainActions.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={item.action}
                    className={cn(
                      "w-[90%] h-9 justify-start px-3 text-sm font-normal hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg ml-2 mb-1",
                      item.active && "bg-zinc-200/80 dark:bg-zinc-800/80"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* BOTTOM SECTION */}
        <div className="relative">
          {/* ACCOUNT ACCORDION */}
          {!collapsed && (
            <>
              <Separator className="bg-zinc-300/40 dark:bg-zinc-700/40 mt-3" />
              <div className="mt-3 mb-2 pb-2 relative">
                <p className="px-2 mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Account
                </p>
                
                {/* Account Button */}
                <Button
                  variant="ghost"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="w-[90%] ml-3 py-1.5 px-2 flex items-center justify-between text-left rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex items-center">
                    <Avatar className="h-7 w-7 flex-shrink-0 ring-1 ring-offset-1 ring-offset-zinc-50/60 dark:ring-offset-zinc-950/60 ring-zinc-300/50 dark:ring-zinc-700/50">
                      <AvatarImage
                        src={user?.profilePicture || user?.image || undefined}
                        alt={user?.name || "User Avatar"}
                      />
                      <AvatarFallback className="bg-zinc-200 text-zinc-700 text-[10px] dark:bg-zinc-800 dark:text-zinc-300 font-medium">
                        {userInitials}
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
                  </div>
                  {accountMenuOpen ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  )}
                </Button>

                {/* Accordion Content */}
                <div 
                  className={cn(
                    "absolute bottom-full left-0 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden transition-all duration-200 mb-1",
                    accountMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  )}
                  style={{ 
                    transform: accountMenuOpen ? 'translateY(0)' : 'translateY(8px)',
                    zIndex: 50
                  }}
                >
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      onClick={handleProfileClick}
                      className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 rounded-md"
                    >
                      <User className="mr-2 h-4 w-4 text-zinc-500" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSettingsClick}
                      className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 rounded-md"
                    >
                      <Settings className="mr-2 h-4 w-4 text-zinc-500" />
                      Settings
                    </Button>
                    <Separator className="my-1 bg-zinc-300/40 dark:bg-zinc-700/40" />
                    
                    {/* Using your GitHub SignOut component */}
                    <div className="px-1">
                      <SignOutWithGitHub 
                        variant="ghost" 
                        className="w-full justify-start text-sm font-normal hover:bg-red-100/60 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-md" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Additional padding at bottom */}
          <div className="h-10"></div>
        </div>
      </div>
      {/* Our SettingsDialog component, controlled by local state */}
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}