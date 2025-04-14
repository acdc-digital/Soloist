// DAILY LOG FORM
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/dailyLogForm.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { parseISO, format } from "date-fns";
import { useUser } from "@/hooks/useUser";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DailyLogFormData {
  overallMood: number;
  workSatisfaction: number;
  personalLifeSatisfaction: number;
  balanceRating: number;
  sleep: number;
  exercise: boolean;
  highlights: string;
  challenges: string;
  tomorrowGoal: string;
}

interface DailyLogFormProps {
  onClose: () => void;
  date?: string;
}

export default function DailyLogForm({ onClose, date }: DailyLogFormProps) {
  const scoreDailyLogAction = useAction(api.score.scoreDailyLog);
  const dailyLogMutation = useMutation(api.dailyLogs.dailyLog);
  const generateFeedForDailyLog = useAction(api.feed.generateFeedForDailyLog);

  const effectiveDate = date ?? new Date().toISOString().split("T")[0];
  const { user, isSignedIn } = useUser();

  // Query existing log if any
  const existingLog = useQuery(api.dailyLogs.getDailyLog, {
    userId: user ? user._id : "",
    date: effectiveDate,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DailyLogFormData>({
    defaultValues: {
      overallMood: 5,
      workSatisfaction: 5,
      personalLifeSatisfaction: 5,
      balanceRating: 5,
      sleep: 7,
      exercise: false,
      highlights: "",
      challenges: "",
      tomorrowGoal: "",
    },
  });

  useEffect(() => {
    if (existingLog && existingLog.answers) {
      reset({
        overallMood: existingLog.answers.overallMood ?? 5,
        workSatisfaction: existingLog.answers.workSatisfaction ?? 5,
        personalLifeSatisfaction: existingLog.answers.personalLifeSatisfaction ?? 5,
        balanceRating: existingLog.answers.balanceRating ?? 5,
        sleep: existingLog.answers.sleep ?? 7,
        exercise: existingLog.answers.exercise ?? false,
        highlights: existingLog.answers.highlights ?? "",
        challenges: existingLog.answers.challenges ?? "",
        tomorrowGoal: existingLog.answers.tomorrowGoal ?? "",
      });
    } else {
      // If no existing log, reset to defaults
      reset();
    }
  }, [date, existingLog, reset]);

  const onSubmit = async (data: DailyLogFormData) => {
    if (!isSignedIn || !user?.id) {
      setError("You must be logged in to submit a log");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const userId = user._id;
      if (!userId) throw new Error("No user ID found in user object.");

      // 1) Save the log
      await dailyLogMutation({
        userId,
        date: effectiveDate,
        answers: data,
        score: undefined,
      });

      // 2) Score it
      await scoreDailyLogAction({
        userId: userId.toString(),
        date: effectiveDate,
      });

      // 3) Generate feed
      await generateFeedForDailyLog({
        userId: userId.toString(),
        date: effectiveDate,
      });

      onClose();
    } catch (err) {
      console.error("Failed to save daily log:", err);
      setError(err instanceof Error ? err.message : "Failed to save your daily log");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 overflow-x-hidden">
      {/* ScrollArea for vertical scrolling only; also ensure no x overflow */}
      <ScrollArea className="flex-1 overflow-x-hidden px-3 py-2">
        <form
          id="daily-log-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-full"
        >
          {/* ============ Ratings Section ============ */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
              Rate Your Day <span className="text-xs">(1-10)</span>
            </h3>

            {/* Overall Mood */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="overallMood" className="text-sm">
                  Overall Mood
                </Label>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {watch("overallMood")}/10
                </span>
              </div>
              <Input
                id="overallMood"
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("overallMood", { required: true, valueAsNumber: true })}
              />
            </div>

            {/* Work Satisfaction */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="workSatisfaction" className="text-sm">
                  Work Satisfaction
                </Label>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {watch("workSatisfaction")}/10
                </span>
              </div>
              <Input
                id="workSatisfaction"
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("workSatisfaction", { required: true, valueAsNumber: true })}
              />
            </div>

            {/* Personal Life Satisfaction */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="personalLifeSatisfaction" className="text-sm">
                  Personal Life
                </Label>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {watch("personalLifeSatisfaction")}/10
                </span>
              </div>
              <Input
                id="personalLifeSatisfaction"
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("personalLifeSatisfaction", { required: true, valueAsNumber: true })}
              />
            </div>

            {/* Work-Life Balance */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="balanceRating" className="text-sm">
                  Work-Life Balance
                </Label>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {watch("balanceRating")}/10
                </span>
              </div>
              <Input
                id="balanceRating"
                type="range"
                min="1"
                max="10"
                step="1"
                {...register("balanceRating", { required: true, valueAsNumber: true })}
              />
            </div>
          </div>

          {/* ============ Basic Wellness ============ */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
              Basic Wellness
            </h3>

            {/* Sleep */}
            <div className="flex items-center space-x-4">
              <Label htmlFor="sleep" className="w-28 text-sm">
                Hours of sleep
              </Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="7"
                className="max-w-[80px]"
                {...register("sleep", { required: true, valueAsNumber: true })}
              />
            </div>

            {/* Exercise */}
            <div className="flex items-center space-x-2">
              <input
                id="exercise"
                type="checkbox"
                className="rounded bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-700 focus:ring-emerald-500 text-emerald-600"
                {...register("exercise")}
              />
              <Label htmlFor="exercise" className="text-sm">
                Exercise today?
              </Label>
            </div>
          </div>

          {/* ============ Key Reflections ============ */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
              Quick Reflections
            </h3>

            {/* Highlights */}
            <div className="space-y-1.5">
              <Label htmlFor="highlights" className="text-sm">
                Today's highlight
              </Label>
              <Textarea
                id="highlights"
                placeholder="What was the best part of your day?"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 placeholder:text-zinc-400 focus:ring-emerald-500"
                {...register("highlights")}
              />
            </div>

            {/* Challenges */}
            <div className="space-y-1.5">
              <Label htmlFor="challenges" className="text-sm">
                Today's challenge
              </Label>
              <Textarea
                id="challenges"
                placeholder="What was challenging?"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 placeholder:text-zinc-400 focus:ring-emerald-500"
                {...register("challenges")}
              />
            </div>

            {/* Tomorrow's focus */}
            <div className="space-y-1.5">
              <Label htmlFor="tomorrowGoal" className="text-sm">
                Tomorrow's focus
              </Label>
              <Textarea
                id="tomorrowGoal"
                placeholder="What's your main focus for tomorrow?"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 placeholder:text-zinc-400 focus:ring-emerald-500"
                {...register("tomorrowGoal")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="daily-log-form"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : existingLog ? (
                "Update Log"
              ) : (
                "Save Log"
              )}
            </Button>
          </div>
        </form>
      </ScrollArea>

      {/* Error or Footer Section */}
      <div className="p-1 text-sm">
        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}