// FEED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Feed.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useFeedStore } from "@/store/feedStore";
import { useUserContext } from "@/provider/userContext";
import { formatDistanceToNow } from "date-fns";
import { 
  Loader2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CommentSection } from "./CommentSection";

// Define Comment type locally to reduce dependencies
type Comment = {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date;
};

export default function Feed() {
  const {
    selectedDate,
    setFeedMessages,
    activeTab,
    feedMessages,
    loading,
    setLoading,
  } = useFeedStore();

  // State for feedback
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, "liked" | "disliked" | null>>({});
  // We'll set these once we have a filtered message
  const [feedId, setFeedId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Direct mutation to add a comment to a feed document
  const updateFeedWithComment = useMutation(api.feed.addComment);

  /* ───────────────────────────────────────────── */
  /* 1 Resolve the current user's stable ID        */
  /* ───────────────────────────────────────────── */
  const { user, isLoading: userLoading } = useUserContext();
  const rawAuthId = user?.authId ?? user?._id ?? user?.id ?? null;
  const userId =
    typeof rawAuthId === "string" ? rawAuthId.split("|")[0] : null;

  /* ───────────────────────────────────────────── */
  /* 2 Query feed messages for that user           */
  /* ───────────────────────────────────────────── */
  const feedMessagesData = useQuery(
    api.feed.listFeedMessages,
    userId ? { userId } : undefined // only send args when we have an ID
  );

  /* ───────────────────────────────────────────── */
  /* 3 Mutation to (re)generate feed for a log     */
  /* ───────────────────────────────────────────── */
  const generateFeed = useMutation(api.feed.generateFeedForDailyLog);
  
  // We'll add these mutations later
  // const submitFeedback = useMutation(api.feed.submitFeedback);

  /* ───────────────────────────────────────────── */
  /* 4 Sync Convex → feedStore when data arrives   */
  /* ───────────────────────────────────────────── */
  useEffect(() => {
    if (feedMessagesData) {
      setFeedMessages(feedMessagesData);
    }
  }, [feedMessagesData, setFeedMessages]);

  /* ───────────────────────────────────────────── */
  /* 5 Helpers                                     */
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

  const handleFeedback = async (messageId: string, isLiked: boolean) => {
    // Update local state immediately for responsive UI
    setFeedbackStatus(prev => ({
      ...prev,
      [messageId]: isLiked ? "liked" : "disliked"
    }));

    // TODO: Implement actual feedback submission to Convex
    // try {
    //   await submitFeedback({ 
    //     messageId,
    //     userId,
    //     isLiked,
    //     date: selectedDate
    //   });
    // } catch (err) {
    //   console.error("Error submitting feedback:", err);
    //   // Revert local state if submission fails
    //   setFeedbackStatus(prev => ({
    //     ...prev,
    //     [messageId]: null
    //   }));
    // }
  };

  // Query to get comments directly
  const fetchFeedComments = useQuery(
    api.feed.getComments,
    feedId ? { feedId: feedId as Id<"feed"> } : "skip"
  );

  // Set the feed ID based on the selected message
  useEffect(() => {
    if (filteredMessages && filteredMessages.length > 0) {
      // Use the first message's ID for the selected date
      const messageId = filteredMessages[0]._id;
      console.log("Setting feed ID from filtered message:", messageId);
      setFeedId(messageId);
    } else {
      setFeedId(null);
    }
  }, [filteredMessages]);

  // Load comments when feedId changes or when fetchFeedComments updates
  useEffect(() => {
    if (fetchFeedComments) {
      console.log("Got comments from backend:", fetchFeedComments);
      // Transform the data to match our Comment type
      const formattedComments = fetchFeedComments.map((comment: any, index: number) => ({
        id: `${feedId}_${index}`,
        userId: comment.userId,
        userName: comment.userName,
        userImage: comment.userImage,
        content: comment.content,
        createdAt: new Date(comment.createdAt)
      }));
      setComments(formattedComments);
      // Clear local comments since they should now be included in the fetched comments
      setLocalComments([]);
    }
  }, [fetchFeedComments, feedId]);

  // Optimistic add
  const handleAddComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
    console.log("Adding comment with feed ID:", feedId);
    if (!feedId) {
      console.error("Cannot add comment: No feed message available for the selected date");
      return;
    }
    
    // Create a temporary comment for optimistic UI update
    const tempComment: Comment = {
      ...commentData,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
    };
    
    // Update UI immediately
    setLocalComments((prev) => [...prev, tempComment]);
    
    try {
      // Simple, direct submission
      await updateFeedWithComment({ 
        feedId: feedId as Id<"feed">, 
        userId: commentData.userId,
        userName: commentData.userName,
        userImage: commentData.userImage,
        content: commentData.content
      });
      console.log("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  /* ───────────────────────────────────────────── */
  /* 6 Loading gate                                */
  /* ───────────────────────────────────────────── */
  if (userLoading || !userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  /* ───────────────────────────────────────────── */
  /* 7 Render                                      */
  /* ───────────────────────────────────────────── */
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="mb-4 p-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">Select a date</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
          Choose a date from the calendar to view insights generated for that day's log.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-0 pt-0">
        {filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <Card
                key={msg._id}
                className="transition-all duration-200 hover:shadow-md bg-card/50"
              >
                <CardContent className="pt-0">
                  <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <p>{msg.message}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between text-xs text-muted-foreground pt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs mr-2">Was this helpful?</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFeedback(msg._id, true)}
                      className={cn(
                        "h-7 w-7 rounded-full",
                        feedbackStatus[msg._id] === "liked" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFeedback(msg._id, false)}
                      className={cn(
                        "h-7 w-7 rounded-full",
                        feedbackStatus[msg._id] === "disliked" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </CardFooter>
              </Card>
            ))}
            {/* Comment list at the bottom of the scrollable area */}
            <div className="space-y-2 mt-4">
              {[...comments, ...localComments]
                // Deduplicate comments by content and created time
                .filter((comment, idx, arr) => {
                  // Find the first comment with the same content and similar timestamp
                  return arr.findIndex(c => 
                    c.content === comment.content && 
                    c.userId === comment.userId &&
                    Math.abs(c.createdAt.getTime() - comment.createdAt.getTime()) < 10000
                  ) === idx;
                })
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                .map(comment => (
                  <div key={comment.id} className="border border-muted rounded-md p-2">
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-xs">{comment.userName}</span>
                    </div>
                    <p className="text-xs mb-1">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 p-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <RefreshCw className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">No insights yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
              Generate AI insights based on your log for {new Date(selectedDate).toLocaleDateString()}.
            </p>
          </div>
        )}
      </div>

      {/* Fixed comment section at the bottom */}
      <div className="flex-none px-4 py-3">
        <CommentSection onAddComment={handleAddComment} />
      </div>
    </div>
  );
}