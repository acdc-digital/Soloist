// SETTINGS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/settings/SettingsDialog.tsx

"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Attributes from "./_components/Attributes";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Preferences</DialogTitle>
          <DialogDescription>Update your appearance or other settings here.</DialogDescription>
        </DialogHeader>

        {/* Example: a simple dark/light toggle */}
        <div className="flex items-center justify-between py-4">
          <div>
            Current theme: <strong>{theme}</strong>
          </div>
          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Switch to {theme === "dark" ? "light" : "dark"}
          </Button>
        </div>

        <div className="py-4 border-t border-zinc-200 dark:border-zinc-700 mt-4">
          <Attributes />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}