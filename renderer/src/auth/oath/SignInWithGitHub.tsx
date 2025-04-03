// GITHUB SIGNIN COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/auth/oath/SignInWithGitHub.tsx

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export function SignInWithGitHub() {
  const { signIn } = useAuthActions();
  return (
    <Button
      className="flex-1"
      variant="outline"
      type="button"
      onClick={() => {
        void signIn("github", { redirectTo: "/dashboard" });
      }}
    >
      <GitHubLogoIcon className="mr-2 h-4 w-4" /> GitHub
    </Button>
  );
}