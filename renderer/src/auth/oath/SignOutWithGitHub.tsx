"use client";

// GITHUB SIGNOUT COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/auth/oath/SignOutWithGitHub.tsx

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
  
  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      type="button"
      onClick={() => {
        void signOut({ redirectTo: "/" });
      }}
    >
      <ExitIcon className="mr-2 h-4 w-4" /> Sign Out
    </Button>
  );
}