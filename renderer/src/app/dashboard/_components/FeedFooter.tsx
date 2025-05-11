// FEED FOOTER 
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/FeedFooter.tsx

"use client";

import { CommentSection } from "./CommentSection";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────── */
/* Types                                         */
/* ───────────────────────────────────────────── */
type Comment = {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date;
};

export interface FeedFooterProps {
  /**
   * Handler passed down from <Feed /> that commits a new comment.
   * Must accept the same shape used previously:
   *   { userId, userName, userImage?, content }
   */
  onAddComment: (commentData: Omit<Comment, "id" | "createdAt">) => Promise<void>;
  /** Optional extra class names for layout tweaks. */
  className?: string;
  /** Whether there's a feed generated for the current day */
  hasFeed?: boolean;
}

/* ───────────────────────────────────────────── */
/* Component                                     */
/* ───────────────────────────────────────────── */
export default function FeedFooter({
    onAddComment,
    className = "",
    hasFeed = true,
  }: FeedFooterProps) {
    // If there's no feed, don't render the comment section
    if (!hasFeed) return null;
    
    return (
        <div
          className={cn(
            "sticky bottom-0 w-full z-10 px-4 py-3 mb-4 bg-zinc-900 border-t",
            className
          )}
        >
          <CommentSection onAddComment={onAddComment} />
        </div>
      );
    }

  