"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function DeleteCommentButton({ commentId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setIsDeleting(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Delete comment error:", deleteError);
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }

    setIsDeleted(true);
    setShowConfirm(false);
    router.refresh();
  }

  if (isDeleted) return null;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-all hover:opacity-80"
        style={{
          background: theme.red + "11",
          color: theme.red,
          border: `1px solid ${theme.red}33`,
          fontSize: "12px",
        }}
        title="Delete comment"
      >
        🗑️
      </button>

      {showConfirm &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                cursor: "pointer",
              }}
              onClick={() => {
                if (!isDeleting) setShowConfirm(false);
              }}
            />

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "32px",
                  maxWidth: "360px",
                  width: "90%",
                  textAlign: "center",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  pointerEvents: "auto",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>

                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: theme.dark,
                    marginBottom: "8px",
                  }}
                >
                  Delete this comment?
                </h2>

                <p
                  style={{
                    fontSize: "14px",
                    color: theme.muted,
                    lineHeight: 1.5,
                    marginBottom: error ? "12px" : "24px",
                  }}
                >
                  Your words of wisdom will be lost forever. Or at least until
                  you type them again.
                </p>

                {error && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: theme.red,
                      marginBottom: "16px",
                    }}
                  >
                    Error: {error}
                  </p>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                    style={{
                      border: `1.5px solid ${theme.border}`,
                      color: theme.dark,
                    }}
                  >
                    Keep it
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: theme.red,
                    }}
                  >
                    {isDeleting ? "⏳ Deleting..." : "Yes, delete it"}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
