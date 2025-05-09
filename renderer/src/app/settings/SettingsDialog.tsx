// SETTINGS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/settings/SettingsDialog.tsx

"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Attributes from "./_components/Attributes";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUserContext } from "@/provider/userContext";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useUserContext();
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get the user ID
  const rawAuthId = user?.authId ?? user?._id ?? user?.id ?? null;
  const userId = typeof rawAuthId === "string" ? rawAuthId.split("|")[0] : null;

  // Fetch existing instructions
  const existingInstructions = useQuery(
    api.randomizer.getInstructions,
    userId ? { userId } : "skip"
  );

  // Save instructions mutation
  const saveInstructionsMutation = useMutation(api.randomizer.saveInstructions);

  // Update the local state when we get existing instructions
  useEffect(() => {
    if (existingInstructions) {
      setInstructions(existingInstructions || "");
    }
  }, [existingInstructions]);

  const handleSaveInstructions = async () => {
    if (!userId) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveInstructionsMutation({
        userId,
        instructions: instructions.trim()
      });
      setSaveSuccess(true);
      // Reset success indicator after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save instructions:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[85vh]">
        <DialogHeader className="pb-2">
          <DialogTitle>User Preferences</DialogTitle>
          <DialogDescription>Update your appearance or other settings here.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="pr-4 max-h-[65vh]">
          {/* Theme toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="text-sm">
              Theme: <strong>{theme}</strong>
            </div>
            <Button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              size="sm"
              variant="outline"
            >
              Switch to {theme === "dark" ? "light" : "dark"}
            </Button>
          </div>

          {/* Attributes Section */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-2">
            <Attributes />
          </div>

          {/* Randomizer Settings Section */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
            <h3 className="text-sm font-medium mb-1">Random Log Generation</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Customize how random daily logs are generated with personalized instructions.
            </p>
            
            <div className="space-y-1 mb-3">
              <label className="text-xs font-medium" htmlFor="instructions">
                Custom Instructions
              </label>
              <Textarea
                id="instructions"
                placeholder="Example: I'm a software developer working on a mobile app. I usually have standups at 10am, and I try to exercise 3 times a week. I'm learning Spanish in my free time."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="resize-y text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Provide context about yourself, schedule, activities, or interests for more personalized random logs.
              </p>
            </div>
            
            <Button 
              onClick={handleSaveInstructions} 
              disabled={isSaving}
              size="sm"
              variant="outline"
              className="flex gap-1 items-center h-7 text-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Saved!
                </>
              ) : (
                "Save Instructions"
              )}
            </Button>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-3 border-t border-zinc-200 dark:border-zinc-700 mt-2">
          <Button variant="secondary" onClick={handleClose} size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}