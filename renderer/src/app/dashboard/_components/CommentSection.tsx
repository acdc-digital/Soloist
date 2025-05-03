// FEED COMMENTS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/CommentSection.tsx

"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { formatDistanceToNow } from "date-fns"

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
  feedId: string
  initialComments?: Comment[]
  onAddComment?: (comment: Omit<Comment, "id" | "createdAt">) => Promise<void>
}

export function CommentSection({ 
  feedId, 
  initialComments = [], 
  onAddComment 
}: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handler for submitting a new comment
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return
    
    setIsSubmitting(true)
    
    // Create a new comment object
    const commentData = {
      userId: user.id,
      userName: user.name || "Anonymous User",
      userImage: user.imageUrl,
      content: newComment.trim()
    }
    
    try {
      // If we have an external handler, call it
      if (onAddComment) {
        await onAddComment(commentData)
      }
      
      // For local state, add a temporary ID and timestamp
      const tempComment: Comment = {
        ...commentData,
        id: `temp-${Date.now()}`,
        createdAt: new Date()
      }
      
      // Update local state
      setComments(prev => [tempComment, ...prev])
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="mt-6 space-y-4 p-4">
      <h3 className="font-medium">Comments</h3>
      {/* Comment input area */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-20 resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment} 
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Comment list */}
      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-4">
            Begin your comments here.
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.userImage} alt={comment.userName} />
                <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}