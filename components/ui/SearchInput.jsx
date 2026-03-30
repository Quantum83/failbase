"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";

export default function SearchInput({
  defaultValue = "",
  autoFocus = false,
  compact = false,
  placeholder = "Search posts, people, or regrets...",
}) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-full focus:outline-none"
          style={{
            padding: compact ? "10px 40px 10px 16px" : "14px 52px 14px 24px",
            background: "white",
            border: `1.5px solid ${theme.border}`,
            color: theme.dark,
            fontSize: compact ? "13px" : "16px",
          }}
        />
        <button
          type="submit"
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            right: compact ? "10px" : "14px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <span style={{ fontSize: compact ? "16px" : "20px" }}>🔍</span>
        </button>
      </div>
    </form>
  );
}
