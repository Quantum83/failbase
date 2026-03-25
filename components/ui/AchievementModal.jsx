"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { theme } from "@/lib/theme";

function ConfettiPiece({ index }) {
  const colors = [
    theme.accent,
    theme.highlight,
    theme.dark,
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
  ];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 1.5 + Math.random() * 1.5;
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;
  const shape = index % 3;

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: "-10px",
        width: shape === 2 ? `${size}px` : `${size * 0.6}px`,
        height: shape === 2 ? `${size}px` : `${size}px`,
        backgroundColor: color,
        borderRadius: shape === 1 ? "50%" : shape === 2 ? "2px" : "0",
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
        opacity: 0,
      }}
    />
  );
}

export default function AchievementModal({ achievements, profileId }) {
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!profileId || achievements.length === 0) return;

    const storageKey = `failbase_achievements_${profileId}`;
    const seen = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const unseen = achievements.filter((a) => !seen.includes(a.label));

    if (unseen.length > 0) {
      setNewAchievements(unseen);
      setCurrentIndex(0);
      setIsVisible(true);

      const allLabels = achievements.map((a) => a.label);
      localStorage.setItem(storageKey, JSON.stringify(allLabels));
    }
  }, [achievements, profileId]);

  const handleDismiss = useCallback(() => {
    if (currentIndex < newAchievements.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsVisible(false);
    }
  }, [currentIndex, newAchievements.length]);

  if (!mounted || !isVisible || newAchievements.length === 0) return null;

  const current = newAchievements[currentIndex];
  const hasMore = currentIndex < newAchievements.length - 1;

  return createPortal(
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 20px)) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes achievement-pop {
          0% {
            transform: scale(0.5) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes emoji-bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={handleDismiss}
      />

      {/* Confetti layer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <ConfettiPiece key={`${currentIndex}-${i}`} index={i} />
        ))}
      </div>

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
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
            pointerEvents: "auto",
            animation: "achievement-pop 0.4s ease-out forwards",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              marginBottom: "12px",
              animation: "emoji-bounce 0.6s ease-in-out 0.3s",
            }}
          >
            {current.emoji}
          </div>

          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: theme.highlight,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Achievement Unlocked!
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: theme.dark,
              marginBottom: "8px",
            }}
          >
            {current.label}
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: theme.muted,
              lineHeight: 1.5,
              marginBottom: "24px",
            }}
          >
            {current.description}
          </p>

          <button
            onClick={handleDismiss}
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
              color: "white",
              border: "none",
              padding: "10px 28px",
              borderRadius: "99px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {hasMore
              ? `Nice! (${newAchievements.length - currentIndex - 1} more)`
              : "Nice!"}
          </button>

          {newAchievements.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {newAchievements.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background:
                      i === currentIndex ? theme.accent : theme.border,
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
