"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { theme } from "@/lib/theme";
import { useToast, Toast } from "@/components/ui/Toast";

function PersonRow({ person, onFollow }) {
  return (
    <div
      className="grid items-center gap-2.5 w-full"
      style={{ gridTemplateColumns: "auto 1fr auto" }}
    >
      <Link
        href={`/profile/${person.username}`}
        className="w-9 h-9 rounded-full overflow-hidden"
      >
        <img
          src={person.avatarUrl}
          alt={person.name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Middle column clamped by Grid */}
      <div className="min-w-0 overflow-hidden">
        <Link
          href={`/profile/${person.username}`}
          className="block truncate hover:underline"
          style={{ fontSize: "12px", fontWeight: 600, color: theme.dark }}
        >
          {person.name}
        </Link>
        <div
          style={{ fontSize: "11px", color: theme.muted }}
          className="truncate"
        >
          {person.title}
        </div>
      </div>

      <button
        onClick={onFollow}
        style={{
          fontSize: "11px",
          color: theme.accent,
          border: `1px solid ${theme.accent}`,
          borderRadius: "99px",
          padding: "2px 10px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        + Follow
      </button>
    </div>
  );
}

function PeopleModal({ people, onClose, onFollow }) {
  return (
    <>
      <div
        className="fixed inset-0"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      >
        <div
          className="card w-full max-w-md max-h-[70vh] flex flex-col"
          style={{ pointerEvents: "auto" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <h2
              style={{ fontSize: "15px", fontWeight: 700, color: theme.dark }}
            >
              People Who Get It
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{
                background: theme.bg,
                color: theme.muted,
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-5 py-4">
            <div className="flex flex-col gap-4">
              {people.map((person) => (
                <PersonRow
                  key={person.username}
                  person={person}
                  onFollow={onFollow}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PeopleSection({ people, initialCount = 3 }) {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast, showToast } = useToast();

  // Safe client-only mounting — fixes hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const visible = people.slice(0, initialCount);
  const hasMore = people.length > initialCount;

  function handleFollow() {
    showToast("Follow is coming soon!", "🔔");
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {visible.map((person) => (
          <PersonRow
            key={person.username}
            person={person}
            onFollow={handleFollow}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowModal(true)}
          className="mt-3 w-full text-center text-xs font-semibold hover:underline py-1"
          style={{ color: theme.accent }}
        >
          See all {people.length} people →
        </button>
      )}

      {/* Only render portals after mount to avoid hydration mismatch */}
      {mounted &&
        showModal &&
        createPortal(
          <PeopleModal
            people={people}
            onClose={() => setShowModal(false)}
            onFollow={handleFollow}
          />,
          document.body,
        )}

      {mounted && toast && createPortal(<Toast toast={toast} />, document.body)}
    </>
  );
}
