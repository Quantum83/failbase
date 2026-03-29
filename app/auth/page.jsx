"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithGitHub,
} from "@/lib/auth";
import { theme } from "@/lib/theme";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/");
    });
  }, [router]);

  // Pick up error from callback redirect (e.g. ?error=auth_failed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackError = params.get("error");
    if (callbackError) {
      setError(
        callbackError === "auth_failed"
          ? "Sign in failed. Please try again."
          : callbackError === "missing_code"
            ? "Something went wrong with the redirect. Please try again."
            : callbackError,
      );
    }
  }, []);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      setIsLoading("email");
      const { data, error } = await signUpWithEmail(email, password, fullName);
      setIsLoading(null);
      if (error) {
        setError(error.message);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        setError(
          "An account with this email already exists. Try signing in instead.",
        );
        return;
      }

      // If email confirmation is disabled, user is immediately signed in
      if (data?.session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("title")
          .eq("auth_id", data.user.id)
          .single();

        if (!profile?.title) {
          router.push("/onboarding");
        } else {
          router.push("/");
        }
        router.refresh();
        return;
      }

      // If email confirmation is enabled, show the message
      setSuccess("Check your email for a confirmation link!");
    } else {
      setIsLoading("email");
      const { data, error } = await signInWithEmail(email, password);
      setIsLoading(null);
      if (error) {
        setError(error.message);
        return;
      }

      // Check if user needs onboarding (no title set)
      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("title")
          .eq("auth_id", data.user.id)
          .single();

        if (!profile?.title) {
          router.push("/onboarding");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    }
  }

  async function handleGoogle() {
    setError("");
    setIsLoading("google");
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setIsLoading(null);
    }
    // If no error, browser redirects to Google — loading state doesn't matter
  }

  async function handleGitHub() {
    setError("");
    setIsLoading("github");
    const { error } = await signInWithGitHub();
    if (error) {
      setError(error.message);
      setIsLoading(null);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-4 -mb-[72px] lg:mb-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
              }}
            >
              f
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: theme.dark,
              }}
            >
              Failbase
            </span>
          </div>
          <h1
            style={{ fontSize: "1.1rem", fontWeight: 600, color: theme.dark }}
          >
            {mode === "signin"
              ? "Welcome back 👋"
              : "Join the honest network 📉"}
          </h1>
          <p style={{ fontSize: "13px", color: theme.muted, marginTop: "4px" }}>
            {mode === "signin"
              ? "Sign in to post your story and react to others."
              : "Create an account. Failures welcome — actually required."}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex flex-col gap-2 mb-5">
            <button
              onClick={handleGoogle}
              disabled={!!isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                border: `1.5px solid ${theme.border}`,
                color: theme.dark,
                background: "white",
              }}
            >
              {isLoading === "google" ? (
                "⏳"
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>
            <button
              onClick={handleGitHub}
              disabled={!!isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#24292e", color: "white" }}
            >
              {isLoading === "github" ? (
                "⏳"
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: theme.border }} />
            <span style={{ fontSize: "12px", color: theme.muted }}>or</span>
            <div className="flex-1 h-px" style={{ background: theme.border }} />
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">📬</div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: theme.dark,
                }}
              >
                {success}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: theme.muted,
                  marginTop: "4px",
                }}
              >
                Check your inbox and click the link to confirm.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{
                    border: `1.5px solid ${theme.border}`,
                    color: theme.dark,
                  }}
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{
                  border: `1.5px solid ${theme.border}`,
                  color: theme.dark,
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{
                  border: `1.5px solid ${theme.border}`,
                  color: theme.dark,
                }}
              />
              {error && (
                <p className="text-sm text-center" style={{ color: theme.red }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={!!isLoading}
                className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
                }}
              >
                {isLoading === "email"
                  ? "⏳ Loading..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>
          )}

          <p
            className="text-center mt-4"
            style={{ fontSize: "13px", color: theme.muted }}
          >
            {mode === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
                setSuccess("");
              }}
              className="font-semibold hover:underline"
              style={{ color: theme.accent }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <p
          className="text-center mt-3"
          style={{ fontSize: "11px", color: theme.muted, opacity: 0.6 }}
        >
          By signing up you agree to be publicly associated with your failures.
        </p>
      </div>
    </div>
  );
}
