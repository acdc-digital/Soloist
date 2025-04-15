"use client";

import React, { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// Store
import { useFeedStore, FeedMessage } from "@/store/feedStore";

// shadcn/ui & icons
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Info, MessageSquareQuoteIcon } from "lucide-react";

export default function Feed() {
  const { user } = useUser();
  const { feedMessages, setFeedMessages, loading, setLoading } = useFeedStore();

  // If the user is logged in, user._id is a string. Otherwise, pass undefined.
  const userId = user ? user._id.toString() : undefined;

  // Query feed messages from Convex
  const feedMessagesRaw = useQuery(api.feed.listFeedMessages, { userId });

  // Sync local store with feed query
  useEffect(() => {
    setLoading(feedMessagesRaw === undefined);
    if (feedMessagesRaw !== undefined) {
      // Sort messages newest-first
      const sorted = [...feedMessagesRaw].sort((a, b) => b.createdAt - a.createdAt);
      setFeedMessages(sorted);
    }
  }, [feedMessagesRaw, setFeedMessages, setLoading]);

  // Format date and time
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const messagesToShow = feedMessages || [];

  return (
    <div className="h-full bg-white flex flex-col transition-all duration-200 ease-in-out">
      {/* Body: Scrollable */}
      <ScrollArea className="flex-1 h-full" type="hover">
        <div className="px-4 py-6">
          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 p-3 bg-gray-100 rounded border border-gray-200"
                >
                  <Skeleton className="h-4 w-1/4 bg-gray-200" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-2/3 bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {/* NO MESSAGES */}
          {!loading && messagesToShow.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 p-4 border border-gray-300 rounded-lg">
              <Info size={24} className="mb-2 text-gray-400" />
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
                  className="bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-sm">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal text-gray-600 border-gray-300 px-2"
                      >
                        {formatDate(msg.date)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400">
                      {formatTime(msg.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-3 bg-gray-100" />
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
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