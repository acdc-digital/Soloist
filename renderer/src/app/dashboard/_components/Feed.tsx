// FEED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Feed.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
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
  Info,
  FileEdit,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CommentSection } from "./CommentSection";
import FeedFooter from "./FeedFooter";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  console.log("Feed component mounting/rendering");
  
  const {
    selectedDate,
    setFeedMessages,
    feedMessages,
    loading,
    setLoading,
    activeTab,
    setActiveTab,
  } = useFeedStore();
  
  console.log("Feed store state:", {
    selectedDate,
    activeTab,
    hasMessages: feedMessages ? feedMessages.length : 0,
    loading
  });

  // State for feedback
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, "liked" | "disliked" | null>>({});
  // We'll set these once we have a filtered message
  const [feedId, setFeedId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Direct mutation to add a comment to a feed document
  const updateFeedWithComment = useMutation(api.feed.addComment);

  // New: feedback mutation
  const submitFeedback = useMutation(api.feedback.submitFeedback);

  /* ───────────────────────────────────────────── */
  /* 1 Resolve the current user's stable ID        */
  /* ───────────────────────────────────────────── */
  const { user, isLoading: userLoading } = useUserContext();
  // Updated user ID extraction with type safety
  const rawAuthId = user ? (
    // For Convex user objects
    'authId' in user ? user.authId : 
    // For document IDs
    '_id' in user ? user._id : 
    // For store user objects
    user.id || null
  ) : null;
  
  const userId = typeof rawAuthId === "string" ? rawAuthId.split("|")[0] : null;
  
  console.log("User data:", { 
    userId, 
    userLoading, 
    userObject: user 
  });

  /* ───────────────────────────────────────────── */
  /* 2 Query feed messages for that user           */
  /* ───────────────────────────────────────────── */
  const feedMessagesData = useQuery(
    api.feed.listFeedMessages,
    userId ? { userId } : "skip" // Skip query when userId is not available
  );
  
  console.log("Feed API response:", { 
    feedMessagesCount: feedMessagesData?.length || 0,
    feedMessagesData: feedMessagesData || "No data" 
  });

  /* ───────────────────────────────────────────── */
  /* 3 Check if daily log exists for this date     */
  /* ───────────────────────────────────────────── */
  const dailyLog = useQuery(
    api.dailyLogs.getDailyLog,
    userId && selectedDate ? { userId, date: selectedDate } : "skip"
  );

  // Debugging: Get all logs for this user to compare
  const allUserLogs = useQuery(
    api.dailyLogs.listAllUserLogs,
    userId ? { userId } : "skip"
  );

  const hasLogForDate = !!dailyLog;
  
  console.log("Daily log check:", {
    selectedDate,
    hasLog: hasLogForDate,
    userId: userId,
    userIdType: typeof userId,
    query: userId && selectedDate ? { userId, date: selectedDate } : "skip",
    dailyLogResponse: dailyLog
  });

  // Log all user logs for debugging
  console.log("All user logs:", {
    userId,
    count: allUserLogs?.length || 0,
    logs: allUserLogs || "No logs found"
  });

  /* ───────────────────────────────────────────── */
  /* 4 Action to (re)generate feed for a log       */
  /* ───────────────────────────────────────────── */
  const generateFeed = useAction(api.feed.generateFeedForDailyLog);
  
  // For debugging: Force reload
  const forceRefresh = () => {
    console.log("Force refreshing - current state:", {
      selectedDate,
      userId,
      hasLogForDate
    });
    
    // Reload the page
    window.location.reload();
  };

  /* ───────────────────────────────────────────── */
  /* 5 Sync Convex → feedStore when data arrives   */
  /* ───────────────────────────────────────────── */
  useEffect(() => {
    console.log("Feed API data changed:", feedMessagesData?.length || 0);
    if (feedMessagesData) {
      setFeedMessages(feedMessagesData);
    }
  }, [feedMessagesData, setFeedMessages]);

  /* ───────────────────────────────────────────── */
  /* 6 Helpers                                     */
  /* ───────────────────────────────────────────── */
  const filteredMessages =
    selectedDate && feedMessages
      ? feedMessages.filter((m) => m.date === selectedDate)
      : [];
      
  console.log("Filtered messages:", {
    selectedDate,
    allMessagesCount: feedMessages?.length || 0,
    filteredCount: filteredMessages.length,
    filteredMessages
  });

  const handleGenerateFeed = async () => {
    if (!selectedDate || !userId) return;
    
    // Check if we have a daily log first
    if (!hasLogForDate) {
      console.error("Cannot generate feed: No daily log exists for this date");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Generating feed for:", { userId, date: selectedDate });
      await generateFeed({ userId, date: selectedDate });
      console.log("Feed generated successfully");
    } catch (err) {
      console.error("Error generating feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, isLiked: boolean) => {
    if (!userId) return;
    
    // Update local state immediately for responsive UI
    setFeedbackStatus(prev => ({
      ...prev,
      [messageId]: isLiked ? "liked" : "disliked"
    }));

    // Submit feedback to backend
    try {
      await submitFeedback({ 
        feedId: messageId as Id<"feed">,
        userId,
        isLiked,
      });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      // Revert local state if submission fails
      setFeedbackStatus(prev => ({
        ...prev,
        [messageId]: null
      }));
    }
  };

  const handleCreateDailyLog = () => {
    // Switch to the log tab to create a log first
    setActiveTab("log");
  };

  // Query to get comments directly
  const fetchFeedComments = useQuery(
    api.feed.getComments,
    feedId ? { feedId: feedId as Id<"feed"> } : "skip"
  );

  // New: Query to get user's feedback for this feed item
  const userFeedback = useQuery(
    api.feedback.getUserFeedback,
    feedId && userId ? { feedId: feedId as Id<"feed">, userId } : "skip"
  );

  // Set the feed ID based on the selected message
  useEffect(() => {
    if (filteredMessages && filteredMessages.length > 0) {
      // Use the first message's ID for the selected date
      const messageId = filteredMessages[0]._id;
      console.log("Setting feed ID from filtered message:", messageId);
      setFeedId(messageId);
    } else {
      console.log("No filtered messages found, clearing feedId");
      setFeedId(null);
    }
  }, [filteredMessages]);

  // Load comments when feedId changes or when fetchFeedComments updates
  useEffect(() => {
    if (fetchFeedComments) {
      console.log("Got comments from backend:", fetchFeedComments);
      // Transform the data to match our Comment type
      const formattedComments = fetchFeedComments.map((comment, index: number) => ({
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

  // New: Update feedback status when userFeedback changes
  useEffect(() => {
    if (feedId && userFeedback) {
      setFeedbackStatus(prev => ({
        ...prev,
        [feedId]: userFeedback?.isLiked ? "liked" : "disliked"
      }));
    }
  }, [userFeedback, feedId]);

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
  /* 7 Loading gate                                */
  /* ───────────────────────────────────────────── */
  if (userLoading || !userId) {
    console.log("Feed rendering loading state - user loading or no userId");
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  /* ───────────────────────────────────────────── */
  /* 8 Date selection required                     */
  /* ───────────────────────────────────────────── */
  if (!selectedDate) {
    console.log("Feed rendering no-date-selected state");
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="mb-4 p-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">Select a date</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
          Choose a date from the calendar to view insights generated for that day&apos;s log.
        </p>
      </div>
    );
  }

  console.log("Feed rendering final state", {
    selectedDate,
    userId,
    feedMessagesCount: feedMessages?.length || 0,
    filteredCount: filteredMessages.length,
    activeTab,
    hasLogForDate
  });

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 64px - 56px)' }}>
        <div className="space-y-4">
          {/* daily summary */}
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
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
            ))
          ) : !hasLogForDate ? (
            // No daily log exists for this date
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4 p-3 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Daily Log Found</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-2">
                You need to create a daily log for {new Date(selectedDate).toLocaleDateString()} before generating insights.
              </p>
              
              {/* Debug information */}
              <div className="mt-2 text-xs text-muted-foreground p-2 border rounded max-w-xs overflow-hidden mb-4">
                <div className="text-left mb-1">Debug info:</div>
                <div className="text-left">User ID: {userId || "none"}</div>
                <div className="text-left">Date: {selectedDate}</div>
                <div className="text-left">Log count: {allUserLogs?.length || 0}</div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleCreateDailyLog}
                  className="flex items-center gap-2"
                >
                  <FileEdit className="h-4 w-4" />
                  Create Daily Log
                </Button>
                
                <Button
                  onClick={forceRefresh}
                  variant="outline"
                  className="text-xs"
                >
                  Force Refresh
                </Button>
              </div>
            </div>
          ) : (
            // Daily log exists but no feed yet
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4 p-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <RefreshCw className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">No insights yet</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-4">
                Generate AI insights based on your log for {new Date(selectedDate).toLocaleDateString()}.
              </p>
              
              {/* Debug information */}
              <div className="mt-2 text-xs text-muted-foreground p-2 border rounded max-w-xs overflow-hidden mb-4">
                <div className="text-left mb-1">Debug info:</div>
                <div className="text-left">User ID: {userId || "none"}</div>
                <div className="text-left">Date: {selectedDate}</div>
                <div className="text-left">Log found: {dailyLog ? "Yes" : "No"}</div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleGenerateFeed} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate Insights
                </Button>
                
                <Button
                  onClick={forceRefresh}
                  variant="outline"
                  className="text-xs"
                >
                  Force Refresh
                </Button>
              </div>
            </div>
          )}

          {/* comments section */}
          {comments.length > 0 && (
            <div className="space-y-2 pb-10">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {comment.userImage && (
                        <img
                          src={comment.userImage}
                          alt={comment.userName}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{comment.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <FeedFooter onAddComment={handleAddComment} />
    </div>
  );
}