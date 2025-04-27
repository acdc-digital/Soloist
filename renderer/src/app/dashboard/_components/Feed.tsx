// FEED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Feed.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useFeedStore } from "@/store/feedStore";
import { useUserContext } from "@/provider/userContext";
import { formatDistanceToNow } from "date-fns";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Feed() {
  const {
    selectedDate,
    setFeedMessages,
    activeTab,
    feedMessages,
    loading,
    setLoading,
  } = useFeedStore();

  /* ───────────────────────────────────────────── */
  /* 1 Resolve the current user's stable ID        */
  /* ───────────────────────────────────────────── */
  const { user, isLoading: userLoading } = useUserContext();
  const rawAuthId = user?.authId ?? user?._id ?? user?.id ?? null;
  const userId =
    typeof rawAuthId === "string" ? rawAuthId.split("|")[0] : null;

  /* ───────────────────────────────────────────── */
  /* 2 Query feed messages for that user           */
  /* ───────────────────────────────────────────── */
  const feedMessagesData = useQuery(
    api.feed.listFeedMessages,
    userId ? { userId } : undefined // only send args when we have an ID
  );

  /* ───────────────────────────────────────────── */
  /* 3 Mutation to (re)generate feed for a log     */
  /* ───────────────────────────────────────────── */
  const generateFeed = useMutation(api.feed.generateFeedForDailyLog);

  /* ───────────────────────────────────────────── */
  /* 4 Sync Convex → feedStore when data arrives   */
  /* ───────────────────────────────────────────── */
  useEffect(() => {
    if (feedMessagesData) {
      setFeedMessages(feedMessagesData);
    }
  }, [feedMessagesData, setFeedMessages]);

  /* ───────────────────────────────────────────── */
  /* 5 Helpers                                     */
  /* ───────────────────────────────────────────── */
  const filteredMessages =
    selectedDate && feedMessages
      ? feedMessages.filter((m) => m.date === selectedDate)
      : [];

  const handleGenerateFeed = async () => {
    if (!selectedDate || !userId) return;
    setLoading(true);
    try {
      await generateFeed({ userId, date: selectedDate });
    } catch (err) {
      console.error("Error generating feed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────────────────────────── */
  /* 6 Loading gate                                */
  /* ───────────────────────────────────────────── */
  if (userLoading || !userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  /* ───────────────────────────────────────────── */
  /* 7 Render                                      */
  /* ───────────────────────────────────────────── */
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-zinc-500">
        {/* … unchanged “Select a date” UI … */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* … header markup unchanged … */}

      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.length > 0 ? (
          /* … render each message … */
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <Card key={msg._id} className="bg-card/50">
                <CardContent className="pt-4">
                  <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <p>{msg.message}</p>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* … empty-state UI with Generate button … */
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* unchanged graphic + copy */}
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateFeed}
              disabled={loading || !userId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}