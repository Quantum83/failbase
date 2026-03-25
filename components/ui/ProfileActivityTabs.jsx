"use client";
import { useState } from "react";
import Link from "next/link";
import CardFailPost from "@/components/cards/CardFailPost";
import DeletePostButton from "@/components/ui/DeletePostButton";
import DeleteCommentButton from "@/components/ui/DeleteCommentButton";
import { theme } from "@/lib/theme";
import { formatDistanceToNow } from "date-fns";

export default function ProfileActivityTabs({
  posts,
  comments,
  currentUserId,
  isOwnProfile,
  username,
}) {
  const [activeTab, setActiveTab] = useState("posts");

  const tabStyle = (isActive) => ({
    color: isActive ? theme.accent : theme.muted,
    borderBottom: isActive
      ? `2px solid ${theme.accent}`
      : "2px solid transparent",
    marginBottom: "-2px",
  });

  return (
    <div>
      <div
        className="flex items-center mb-4"
        style={{ borderBottom: `2px solid ${theme.border}` }}
      >
        <button
          onClick={() => setActiveTab("posts")}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
          style={tabStyle(activeTab === "posts")}
        >
          Posts · {posts.length}
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
          style={tabStyle(activeTab === "comments")}
        >
          Comments · {comments.length}
        </button>
      </div>

      {activeTab === "posts" &&
        (posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                {isOwnProfile && (
                  <div className="absolute top-3 right-3 z-10">
                    <DeletePostButton
                      postId={post.id}
                      iconOnly
                      redirectTo={`/profile/${username}`}
                    />
                  </div>
                )}
                <CardFailPost post={post} currentUserId={currentUserId} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center" style={{ color: theme.muted }}>
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm font-medium">No posts yet.</p>
            {isOwnProfile && (
              <Link
                href="/submit"
                className="inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
                }}
              >
                Post your first failure →
              </Link>
            )}
          </div>
        ))}

      {activeTab === "comments" &&
        (comments.length > 0 ? (
          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <div key={comment.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p
                    style={{
                      fontSize: "13px",
                      color: theme.dark,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      flex: 1,
                    }}
                  >
                    {comment.content}
                  </p>
                  {isOwnProfile && (
                    <div className="shrink-0">
                      <DeleteCommentButton commentId={comment.id} />
                    </div>
                  )}
                </div>
                <div
                  className="flex items-center gap-2 mt-2"
                  style={{ fontSize: "11px", color: theme.muted }}
                >
                  <span>
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  <span>·</span>
                  <Link
                    href={`/post/${comment.post_id}`}
                    className="hover:underline"
                    style={{ color: theme.accent }}
                  >
                    {comment.posts?.author_name
                      ? `on ${comment.posts.author_name}'s post`
                      : "on a post"}
                  </Link>
                </div>
                {comment.posts?.content && (
                  <div
                    className="mt-2 px-3 py-2 rounded-lg"
                    style={{
                      background: theme.sand,
                      fontSize: "12px",
                      color: theme.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    {comment.posts.content.length > 120
                      ? comment.posts.content.slice(0, 120) + "..."
                      : comment.posts.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center" style={{ color: theme.muted }}>
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-medium">No comments yet.</p>
          </div>
        ))}
    </div>
  );
}
