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
  onAddComment: (commentData: Omit<Comment, "id" | "createdAt">) => void;
  /** Optional extra class names for layout tweaks. */
  className?: string;
}

/* ───────────────────────────────────────────── */
/* Component                                     */
/* ───────────────────────────────────────────── */
export default function FeedFooter({
    onAddComment,
    className = "",
  }: FeedFooterProps) {
    return (
        <div
          className={cn(
            "sticky bottom-0 w-full z-10 px-4 py-3 bg-background border-t",
            className
          )}
        >
          <CommentSection onAddComment={onAddComment} />
        </div>
      );
    }

  