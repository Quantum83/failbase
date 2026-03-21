import { theme } from "@/lib/theme";

export default function LayoutFooter() {
  return (
    <footer
      className="py-8"
      style={{ borderTop: `1px solid ${theme.border}`, background: "white" }}
    >
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-xs"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
            }}
          >
            f
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: theme.dark,
            }}
          >
            Failbase
          </span>
        </div>

        <p
          style={{ fontSize: "12px", color: theme.muted, marginBottom: "4px" }}
        >
          Failbase © {new Date().getFullYear()} —{" "}
          <em>Failure is the whole point.</em>
        </p>

        <p
          style={{ fontSize: "13px", color: theme.muted, marginBottom: "12px" }}
        >
          Built by <strong style={{ color: theme.dark }}>BasZak</strong>
        </p>

        <div className="flex items-center justify-center gap-3">
          <a
            href="https://www.linkedin.com/in/basem-zaky-450733312/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-opacity hover:opacity-70"
            style={{ color: theme.muted }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://x.com/BasZak25"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="transition-opacity hover:opacity-70"
            style={{ color: theme.muted }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="mailto:baszaksocial@gmail.com"
            aria-label="Email"
            className="transition-opacity hover:opacity-70"
            style={{ color: theme.muted }}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>
          <a
            href="https://insigh.to/b/failbase"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Suggest a feature"
            title="Suggest a feature"
            className="transition-opacity hover:opacity-70"
            style={{ color: theme.muted }}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </a>
          <a
            href="https://ko-fi.com/baszak"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support on Ko-fi"
            title="Buy me a coffee"
            className="transition-opacity hover:opacity-70"
            style={{ color: theme.muted }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M18 8h1.5a2.5 2.5 0 0 1 0 5H18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M4 8h14v3c0 3.87-3.13 7-7 7s-7-3.13-7-7V8z"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M9 4c0 1 .5 2 2 2s2-1 2-2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
