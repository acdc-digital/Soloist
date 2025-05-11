// FEED COMMENTS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/CommentSection.tsx

"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { getUserId } from "@/utils/userUtils"

// Define types for our comments
type Comment = {
  id: string
  userId: string
  userName: string
  userImage?: string
  content: string
  createdAt: Date
}

type CommentSectionProps = {
  onAddComment?: (comment: Omit<Comment, "id" | "createdAt">) => Promise<void>
}

export function CommentSection({ onAddComment }: CommentSectionProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)

  // Get the user ID consistently
  const userId = getUserId(user);

  // Handler for submitting a new comment
  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    // Validate inputs
    if (!user || !userId || !newComment.trim()) return
    
    // Prevent double submission
    if (isSubmitting) return;
    
    // Throttle submissions - prevent multiple submissions within 3 seconds
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
      console.log("Submission throttled - too soon after last comment");
      return;
    }
    
    setIsSubmitting(true)
    setLastSubmitTime(now)
    try {
      // Create a new comment object
      const commentData = {
        userId,
        userName: user.name || "Anonymous User",
        userImage: user.imageUrl || undefined,
        content: newComment.trim()
      }
      // If we have an external handler, call it
      if (onAddComment) {
        console.log("Submitting comment:", commentData);
        await onAddComment(commentData)
      }
      
      // Clear the input
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="relative flex items-center p-0 pt-0"
      onSubmit={handleSubmitComment}
    >
      <Textarea
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="min-h-[42px] resize-none text-sm pr-12"
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitComment();
          }
        }}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="absolute right-2 bottom-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm p-1 transition"
        disabled={!newComment.trim() || isSubmitting}
        tabIndex={0}
        aria-label="Post comment"
        title="Post comment"
      >
        {isSubmitting ? (
          <span className="animate-pulse">...</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M12 19V5M5 12l7-7 7 7"></path>
          </svg>
        )}
      </button>
    </form>
  )
}