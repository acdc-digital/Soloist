// SETTINGS COMPONENT
// /renderer/src/app/dashboard/_components/Settings.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUserContext } from "@/provider/userContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Settings() {
  const { user, isLoading: userLoading } = useUserContext();
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

  // Handle form submission
  const handleSave = async () => {
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

  // Loading state
  if (userLoading || !userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full overflow-x-hidden px-3 py-2">
      <div className="container max-w-2xl py-6">
        <Card>
          <CardHeader>
            <CardTitle>Random Log Generation Settings</CardTitle>
            <CardDescription>
              Customize how random daily logs are generated. Your instructions will be used to guide the AI when creating random entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="instructions">
                  Custom Instructions
                </label>
                <Textarea
                  id="instructions"
                  placeholder="Example: I'm a software developer working on a mobile app. I usually have standups at 10am, and I try to exercise 3 times a week. I'm learning Spanish in my free time."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={6}
                  className="resize-y"
                />
                <p className="text-sm text-muted-foreground">
                  Provide context about yourself, your typical schedule, activities, or interests. This information will be used to make randomly generated logs more personalized and realistic.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !instructions.trim()}
              className="flex gap-2 items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Instructions
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ScrollArea>
  );
} 