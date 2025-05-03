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

export function useComments(feedId: string | Id<"feeds">) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Check if feedId is valid before querying
  const isValidId = typeof feedId === 'string' && feedId.length > 0
  
  // Only run the query if we have a valid feedId
  const commentsData = useQuery(
    api.comments.getByFeedId, 
    isValidId ? { feedId: feedId as Id<"feeds"> } : "skip"
  )
  
  // Create a new comment
  const addComment = useMutation(api.comments.create)
  
  // Format the comments data
  const comments: Comment[] = commentsData?.map(comment => ({
    id: comment._id,
    userId: comment.userId,
    userName: comment.userName,
    userImage: comment.userImage,
    content: comment.content,
    createdAt: new Date(comment._creationTime)
  })) || []
  
  // Handle adding a new comment
  const handleAddComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
    if (!isValidId) {
      console.error("Cannot add comment: Invalid feed ID")
      return
    }
    
    await addComment({
      feedId: feedId as Id<"feeds">,
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