// DAILY LOG FORM
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/dailyLogForm.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUserContext } from "@/provider/userContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFeedStore } from "@/store/feedStore";
import { addDays, format, subDays } from "date-fns";
import { useConvex } from "convex/react";

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
  onClose: () => void; // still used for cancel button
  date?: string;
}

/**
 * Client‑side form for creating/updating a daily log.
 * Server logic lives in `convex/dailyLogs.ts`.
 */
export default function DailyLogForm({ onClose, date }: DailyLogFormProps) {
  console.log("DailyLogForm mounted");
  const { user, isLoading: userLoading } = useUserContext();

  /* ────────────────────────────────────────── */
  /* Feed store hooks                           */
  /* ────────────────────────────────────────── */
  const setActiveTab     = useFeedStore((s) => s.setActiveTab);
  const setSidebarOpen   = useFeedStore((s) => s.setSidebarOpen);
  const setSelectedDate  = useFeedStore((s) => s.setSelectedDate);

  const effectiveDate = date ?? new Date().toISOString().split("T")[0];

  // Current authenticated user ID
  const rawAuthId = user?.authId ?? user?._id ?? user?.id ?? null;
  const userId = typeof rawAuthId === "string" ? rawAuthId.split("|")[0] : null;

  // Fetch existing log for the day
  const existingLog = useQuery(
    api.dailyLogs.getDailyLog,
    userId ? { date: effectiveDate, userId } : undefined
  );

  const dailyLogMutation = useMutation(api.dailyLogs.dailyLog);
  const scoreDailyLog    = useAction(api.score.scoreDailyLog);
  const generateFeed     = useAction(api.feed.generateFeedForDailyLog);
  const generateForecast = useAction(api.forecast.generateForecast);
  const convex = useConvex();

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

  /* ────────────────────────────────────────── */
  /* Populate defaults when a log already exists */
  /* ────────────────────────────────────────── */
  useEffect(() => {
    if (existingLog?.answers) {
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
    }
  }, [existingLog, reset]);

  /* ────────────────────────────────────────── */
  /* Local state                               */
  /* ────────────────────────────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userLoading || !userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  /* ────────────────────────────────────────── */
  /* Form submit handler                       */
  /* ────────────────────────────────────────── */
  const onSubmit = async (data: DailyLogFormData) => {
    console.log("DailyLogForm onSubmit called", { effectiveDate, userId, data });
    setError(null);
    setIsSubmitting(true);

    try {
      await dailyLogMutation({ date: effectiveDate, userId, answers: data });
      await scoreDailyLog({ date: effectiveDate, userId });
      await generateFeed({ date: effectiveDate, userId });

      // --- Check if last 4 days (today + previous 3) all have logs ---
      const today = new Date(effectiveDate);
      const startDate = format(subDays(today, 3), 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');
      const logs = await convex.query(api.forecast.getLogsForUserInRangeSimple, {
        userId,
        startDate,
        endDate,
      });
      console.log("Fetched logs for last 4 days:", logs);
      const logDates = logs.map((log: { date: string }) => log.date);
      const expectedDates = Array.from({ length: 4 }, (_, i) => format(subDays(today, 3 - i), 'yyyy-MM-dd'));
      console.log("Expected dates:", expectedDates);
      const allPresent = expectedDates.every(date => logDates.includes(date));
      console.log("All present?", allPresent);
      if (allPresent) {
        const result = await generateForecast({ userId, startDate, endDate });
        console.log("generateForecast result:", result);
      }

      /* ───── Switch the sidebar to Feed view ───── */
      setSelectedDate(effectiveDate);
      setActiveTab("feed");
      setSidebarOpen(true);
    } catch (err) {
      console.error("Failed to save daily log:", err);
      setError(err instanceof Error ? err.message : "Failed to save log");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ────────────────────────────────────────── */
  /* UI                                        */
  /* ────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 overflow-x-hidden">
      <ScrollArea className="flex-1 overflow-x-hidden px-3 py-2">
        <form
          id="daily-log-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-full"
        >
          {/* Ratings Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
              Rate Your Day <span className="text-xs">(1‑10)</span>
            </h3>
            {[
              ["overallMood", "Overall Mood"],
              ["workSatisfaction", "Work Satisfaction"],
              ["personalLifeSatisfaction", "Personal Life"],
              ["balanceRating", "Work‑Life Balance"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field} className="text-sm">
                    {label}
                  </Label>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {watch(field as any)}/10
                  </span>
                </div>
                <Input
                  id={field}
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  {...register(field as any, {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
              </div>
            ))}
          </div>

          {/* Basic Wellness */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
              Basic Wellness
            </h3>
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
                className="max-w-[80px]"
                {...register("sleep", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
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

          {/* Quick Reflections */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
              Quick Reflections
            </h3>
            {[
              [
                "highlights",
                "Today's highlight",
                "What was the best part of your day?",
              ],
              ["challenges", "Today's challenge", "What was challenging?"],
              [
                "tomorrowGoal",
                "Tomorrow's focus",
                "What's your main focus for tomorrow?",
              ],
            ].map(([field, label, placeholder]) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={field} className="text-sm">
                  {label}
                </Label>
                <Textarea
                  id={field}
                  placeholder={placeholder as string}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 placeholder:text-zinc-400 focus:ring-emerald-500"
                  {...register(field as any)}
                />
              </div>
            ))}
          </div>
        </form>
      </ScrollArea>

      {/* Footer */}
      <div className="sticky bottom-0 w-full dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2">
        {error && (
          <div className="flex items-center space-x-2 mb-2 text-red-600">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
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
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
