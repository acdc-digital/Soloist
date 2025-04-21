// FEED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Feed.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useFeedStore } from "@/store/feedStore";
import { useUserStore } from "@/store/userStore";
import { formatDistanceToNow } from "date-fns";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Feed() {
  const { selectedDate, setFeedMessages, activeTab, feedMessages, loading, setLoading } = useFeedStore();
  const { user } = useUserStore();
  const userId = user?._id ?? "";
  
  // Fetch feed messages for the user
  const feedMessagesData = useQuery(api.feed.listFeedMessages, { userId });
  
  // Generate feed message mutation
  const generateFeed = useMutation(api.feed.generateFeedForDailyLog);
  
  // Update feed state when data changes
  useEffect(() => {
    if (feedMessagesData) {
      setFeedMessages(feedMessagesData);
    }
  }, [feedMessagesData, setFeedMessages]);

  // Filter messages for selected date
  const filteredMessages = selectedDate && feedMessages
    ? feedMessages.filter(msg => msg.date === selectedDate)
    : [];

  const handleGenerateFeed = async () => {
    if (!selectedDate || !userId) return;
    
    setLoading(true);
    try {
      await generateFeed({ userId, date: selectedDate });
      // Feedback will be automatically updated via the useQuery hook
    } catch (error) {
      console.error("Error generating feed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-zinc-500">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-2"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <p className="text-lg font-medium">Select a date</p>
        </div>
        <p>Click on a day in the calendar to view insights.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {activeTab === "feed" ? "Solomon's Insights" : "Daily Log"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {selectedDate}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card key={message._id} className="bg-card/50">
                <CardContent className="pt-4">
                  <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <p>{message.message}</p>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4">
              <div className="rounded-full bg-muted p-3 w-12 h-12 flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium">No insights yet</h3>
            </div>
            <p className="mb-4 text-muted-foreground">
              Generate AI insights from your daily log.
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateFeed}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
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