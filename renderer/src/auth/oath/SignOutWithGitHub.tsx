// GITHUB SIGNOUT COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/auth/oath/SignOutWithGitHub.tsx

"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { ExitIcon } from "@radix-ui/react-icons";

type SignOutWithGitHubProps = {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function SignOutWithGitHub({
  variant = "outline",
  size = "default",
  className = "flex-1",
}: SignOutWithGitHubProps) {
  const { signOut } = useAuthActions();
  
  const handleSignOut = () => {
    try {
      // Call signOut without parameters first
      signOut();
      
      // Then manually redirect using window.location
      // This happens after the signOut process is complete
      window.location.href = "/";
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  
  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      type="button"
      onClick={handleSignOut}
    >
      <ExitIcon className="mr-2 h-4 w-4" /> Sign Out
    </Button>
  );
}