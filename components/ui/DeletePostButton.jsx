"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function DeletePostButton({
  postId,
  iconOnly = false,
  redirectTo = "/",
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      setIsDeleting(false);
      setShowConfirm(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-all hover:opacity-80 ${
          iconOnly ? "w-8 h-8" : "px-4 py-2"
        }`}
        style={{
          background: theme.red + "11",
          color: theme.red,
          border: `1px solid ${theme.red}33`,
        }}
        title="Delete post"
      >
        🗑️{!iconOnly && " Delete"}
      </button>

      {showConfirm &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
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

            {/* Modal */}
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
                  maxWidth: "400px",
                  width: "90%",
                  textAlign: "center",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  pointerEvents: "auto",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗑️</div>

                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: theme.dark,
                    marginBottom: "8px",
                  }}
                >
                  Delete this failure?
                </h2>

                <p
                  style={{
                    fontSize: "14px",
                    color: theme.muted,
                    lineHeight: 1.5,
                    marginBottom: "24px",
                  }}
                >
                  This will permanently remove your post, all its reactions, and
                  comments. Even your shame has limits.
                </p>

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
