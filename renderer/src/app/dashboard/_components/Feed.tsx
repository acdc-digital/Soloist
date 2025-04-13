// FEED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Feed.tsx

"use client";

import React, { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
// Convex
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// Store
import { useFeedStore, FeedMessage } from "@/store/feedStore";

// Icons & UI
import { Info, MessageSquare, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Feed() {
  const { user } = useUser();

  // Access feed state & actions
  const { feedMessages, setFeedMessages, loading, setLoading } = useFeedStore();

  // If we have a user doc, get _id as a string, or undefined if not logged in
  const userId = user ? user._id.toString() : undefined;

  // Perform convex query for feed messages, pass userId or undefined
  const feedMessagesRaw = useQuery(api.feed.listFeedMessages, { userId });

  // On each render or data change, update feed store
  useEffect(() => {
    // show loading spinner while feedMessagesRaw is undefined
    setLoading(feedMessagesRaw === undefined);
    if (feedMessagesRaw !== undefined) {
      // sort messages newest first, then store them
      const sorted = [...feedMessagesRaw].sort((a, b) => b.createdAt - a.createdAt);
      setFeedMessages(sorted);
    }
  }, [feedMessagesRaw, setFeedMessages, setLoading]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // We'll display from the store:
  const messagesToShow = feedMessages || [];

  return (
    <div className="h-full bg-zinc-900/95 border-l border-zinc-800 flex flex-col transition-all duration-200 ease-in-out">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-semibold text-zinc-50 flex items-center gap-2">
          <MessageSquare size={18} className="text-zinc-400" />
          Feed
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Your insights and observations
        </p>
      </div>

      {/* Body: scrollable area */}
      <ScrollArea className="flex-1 h-full" type="hover">
        <div className="px-4 py-6">
          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-400">
              <Loader2 size={24} className="animate-spin mb-2" />
              <p className="text-sm">Loading your insights...</p>
            </div>
          )}

          {/* NO MESSAGES */}
          {!loading && messagesToShow.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-400 p-4 border border-dashed border-zinc-800 rounded-lg">
              <Info size={24} className="mb-2 text-zinc-500" />
              <p className="text-sm text-center">
                No insights yet! Complete a daily log to get started.
              </p>
            </div>
          )}

          {/* SHOW MESSAGES */}
          {messagesToShow.length > 0 && (
            <div className="space-y-4 pb-2">
              {messagesToShow.map((msg: FeedMessage) => (
                <Card
                  key={msg._id}
                  className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/80 transition-colors duration-200"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal text-zinc-300 border-zinc-700 px-2"
                      >
                        {formatDate(msg.date)}
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <Separator className="mb-3 bg-zinc-700/50" />
                    <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                      {msg.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}