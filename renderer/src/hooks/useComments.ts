import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

export type Comment = {
  id: string
  userId: string
  userName: string
  userImage?: string
  content: string
  createdAt: Date
}

// Type for comment data from Convex
type CommentDoc = {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: number;
}

export function useComments(feedId: string | Id<"feed">) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Log the feed ID for debugging
  console.log("useComments received feedId:", feedId, typeof feedId);
  
  // Convert feedId to the right format if needed
  let validatedFeedId: Id<"feed"> | null = null;
  
  if (typeof feedId === 'object') {
    // Already an Id object
    validatedFeedId = feedId;
    console.log("Using object ID directly:", validatedFeedId);
  } else if (typeof feedId === 'string') {
    if (feedId.startsWith('feed:')) {
      // Valid Convex ID format
      validatedFeedId = feedId as Id<"feed">;
      console.log("Using string ID as-is:", validatedFeedId);
    } else {
      // Invalid ID format
      console.error("Invalid feed ID format, expected feed:xxx but got:", feedId);
    }
  } else {
    console.error("Unexpected feedId type:", typeof feedId);
  }
  
  const isValidId = validatedFeedId !== null;
  
  // Only run the query if we have a valid feedId
  const commentsData = useQuery(
    api.comments.getByFeedId, 
    isValidId && validatedFeedId ? { feedId: validatedFeedId } : "skip"
  )
  
  // Create a new comment
  const addComment = useMutation(api.comments.create)
  
  // Format the comments data
  const comments: Comment[] = commentsData?.map((comment: CommentDoc) => ({
    id: comment._id,
    userId: comment.userId,
    userName: comment.userName,
    userImage: comment.userImage,
    content: comment.content,
    createdAt: new Date(comment.createdAt)
  })) || []
  
  // Handle adding a new comment
  const handleAddComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
    if (!isValidId || !validatedFeedId) {
      console.error("Cannot add comment: Invalid feed ID", feedId)
      return
    }
    
    console.log("Adding comment to feed:", validatedFeedId);
    await addComment({
      feedId: validatedFeedId,
      userId: commentData.userId,
      userName: commentData.userName,
      userImage: commentData.userImage,
      content: commentData.content
    })
  }
  
  useEffect(() => {
    if (commentsData !== undefined) {
      setIsLoading(false)
    }
  }, [commentsData])
  
  return {
    comments,
    isLoading,
    addComment: handleAddComment
  }
}