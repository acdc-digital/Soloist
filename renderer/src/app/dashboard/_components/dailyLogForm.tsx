"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@/hooks/useUser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";

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
  const { user } = useUser();
  const userId = user?._id ?? "";

  const effectiveDate = date ?? new Date().toISOString().split("T")[0];

  const existingLog = useQuery(api.dailyLogs.getDailyLog, {
    userId,
    date: effectiveDate,
  });

  const dailyLogMutation = useMutation(api.dailyLogs.dailyLog);
  const scoreDailyLog = useAction(api.score.scoreDailyLog);
  const generateFeed = useAction(api.feed.generateFeedForDailyLog);

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
    if (existingLog?.answers) {
      reset({
        overallMood: existingLog.answers.overallMood ?? 5,
        workSatisfaction: existingLog.answers.workSatisfaction ?? 5,
        personalLifeSatisfaction:
          existingLog.answers.personalLifeSatisfaction ?? 5,
        balanceRating: existingLog.answers.balanceRating ?? 5,
        sleep: existingLog.answers.sleep ?? 7,
        exercise: existingLog.answers.exercise ?? false,
        highlights: existingLog.answers.highlights ?? "",
        challenges: existingLog.answers.challenges ?? "",
        tomorrowGoal: existingLog.answers.tomorrowGoal ?? "",
      });
    }
  }, [existingLog, reset]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: DailyLogFormData) => {
    setError(null);
    setIsSubmitting(true);
    setError(null);
    setIsSubmitting(true);

    try {
      await dailyLogMutation({
        userId,
        date: effectiveDate,
        answers: data,
        score: undefined,
      });
      await scoreDailyLog({ userId, date: effectiveDate });
      await generateFeed({ userId, date: effectiveDate });
      onClose();
    } catch (err) {
      console.error("Failed to save daily log:", err);
      setError(err instanceof Error ? err.message : "Failed to save log");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Rate Your Day <span className="text-xs">(1-10)</span>
            </h3>
            {[
              ["overallMood", "Overall Mood"],
              ["workSatisfaction", "Work Satisfaction"],
              ["personalLifeSatisfaction", "Personal Life"],
              ["balanceRating", "Work-Life Balance"],
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
              ["highlights", "Today's highlight", "What was the best part of your day?"],
              ["challenges", "Today's challenge", "What was challenging?"],
              ["tomorrowGoal", "Tomorrow's focus", "What's your main focus for tomorrow?"],
            ].map(([field, label, placeholder]) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={field} className="text-sm">
                  {label}
                </Label>
                <Textarea
                  id={field}
                  placeholder={placeholder}
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