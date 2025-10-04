"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const redirect = search.get("redirect") || "/chat";
  const [isError, setIsError] = useState(false);

  const mapAuthError = (raw: string): string => {
    const m = (raw || "").toLowerCase();
    if (
      m.includes("already registered") ||
      m.includes("email already") ||
      m.includes("in use")
    ) {
      return "Email already exists. Try signing in instead.";
    }
    if (m.includes("at least 6") || m.includes("password should")) {
      return "Password must be at least 6 characters.";
    }
    if (m.includes("invalid login")) {
      return "Incorrect email or password.";
    }
    if (m.includes("not confirmed")) {
      return "Please verify your email via the link we sent.";
    }
    if (
      m.includes("too many") ||
      m.includes("rate limit") ||
      m.includes("429")
    ) {
      return "Too many attempts. Please try again later.";
    }
    if (m.includes("expired") && m.includes("otp")) {
      return "This magic link expired. Request a new one.";
    }
    return raw || "Something went wrong.";
  };

  useEffect(() => {
    const handleRedirect = async () => {
      const code = search.get("code");
      if (code) {
        try {
          setStatus("Confirming your email...");
          // @ts-expect-error available at runtime in supabase-js v2
          await supabase.auth.exchangeCodeForSession({ code });
          const { data } = await supabase.auth.getUser();
          const user = data.user;
          if (user) {
            await supabase
              .from("users")
              .upsert({ id: user.id, email: user.email ?? "" })
              .select("id")
              .single();
            // Redirect to intended page after confirmation
            router.replace(redirect);
            return;
          }
        } catch {
          setStatus("Failed to confirm email. Please try again.");
          setIsError(true);
        }
      }

      // Check if already signed in
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        await supabase
          .from("users")
          .upsert({ id: user.id, email: user.email ?? "" })
          .select("id")
          .single();
        router.replace(redirect);
      }
    };
    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUpWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirect}`,
        },
      });
      if (error) {
        setStatus(
          mapAuthError(error.message || "Failed to sign up with Google")
        );
        setIsError(true);
      }
    } catch {
      setStatus("Failed to sign up with Google");
      setIsError(true);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setIsError(false);
    try {
      if (password) {
        const { data: signUpData, error: signUpErr } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}${redirect}`,
            },
          });
        if (signUpErr) {
          setStatus(mapAuthError(signUpErr.message || "Failed to sign up"));
          setIsError(true);
          return;
        }
        // If session returned, sign-in is complete
        if (signUpData.session && signUpData.user) {
          await supabase
            .from("users")
            .upsert({
              id: signUpData.user.id,
              email: signUpData.user.email ?? "",
            })
            .select("id")
            .single();
          router.replace(redirect);
          return;
        }
        // No session = email confirmation required
        if (signUpData.user && !signUpData.session) {
          setStatus(
            "Please check your email and click the confirmation link to complete signup."
          );
          setIsError(false);
          return;
        }
      } else {
        const redirectTo = `${
          window.location.origin
        }/signup?redirect=${encodeURIComponent(redirect)}`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
        });
        if (error) {
          setStatus(mapAuthError(error.message || "Failed to send magic link"));
          setIsError(true);
          return;
        }
        setStatus("Check your email for the magic link.");
        setIsError(false);
      }
    } catch (err: unknown) {
      const message = ((): string => {
        if (typeof err === "object" && err !== null && "message" in err) {
          const m = (err as { message?: unknown }).message;
          return typeof m === "string" ? m : "Failed to sign up";
        }
        return "Failed to sign up";
      })();
      setStatus(message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      const openedFrom = search.get("from");
      if (openedFrom === "login") {
        router.push("/");
        return;
      }
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    }, 220);
  };

  return (
    <main className="relative min-h-screen w-full px-6 py-14 sm:py-20 flex items-center justify-center">
      {/* Backdrop overlay with subtle blur */}
      <div
        className={`fixed inset-0 z-10 cursor-pointer bg-black/5 backdrop-blur-[1px] transition-opacity duration-200 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        onClick={navigateBack}
        aria-label="Close sign up and go back"
        role="button"
      />

      {/* Ambient background for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animated-gradient absolute -top-1/4 left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full opacity-60" />
        <div className="orb absolute -left-10 top-20 h-40 w-40 opacity-40" />
        <div className="orb absolute bottom-10 right-10 h-52 w-52 opacity-40" />
      </div>

      {/* Modal card */}
      <div
        className={`glass-card rounded-2xl w-full max-w-md p-6 sm:p-8 z-20 transition-all duration-200 ${
          closing
            ? "opacity-0 -translate-y-2 scale-[0.98]"
            : "opacity-100 translate-y-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-semibold">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted">Join and start your journey</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3 w-full">
          <label className="text-sm" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="h-11 rounded-lg border border-default bg-[var(--panel)] px-3 outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--foreground)_20%,transparent)]"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <label className="mt-2 text-sm" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="h-11 rounded-lg border border-default bg-[var(--panel)] px-3 outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--foreground)_20%,transparent)]"
            type="password"
            placeholder="Leave empty to get a magic link"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn hover-lift-enhanced mt-4 h-11 rounded-lg bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--foreground)_20%,transparent)] disabled:opacity-60"
            disabled={loading || !email}
          >
            {loading
              ? "Please wait…"
              : password
              ? "Create account"
              : "Send a link to your email"}
          </button>
        </form>

        {status && (
          <p
            className={`mt-3 text-sm ${
              isError ? "text-red-400" : "text-green-400"
            }`}
          >
            {status}
          </p>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-default" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[var(--panel)] px-2 text-muted">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={signUpWithGoogle}
          className="btn hover-lift-enhanced w-full h-11 rounded-lg bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>

        <div className="mt-6 text-center text-sm text-muted">
          Have an account?{" "}
          <Link href="/login" className="underline hover:no-underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
