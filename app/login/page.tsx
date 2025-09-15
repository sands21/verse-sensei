"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      // Handle magic-link redirect (PKCE)
      const code = search.get("code");
      if (code) {
        try {
          setStatus("Signing you in...");
          // @ts-expect-error available at runtime in supabase-js v2
          await supabase.auth.exchangeCodeForSession({ code });
        } catch {
          // ignore
        }
      }

      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        // Upsert profile
        await supabase
          .from("users")
          .upsert({ id: user.id, email: user.email ?? "" })
          .select("id")
          .single();
        router.replace("/chat");
      }
    };
    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      // If password provided, prefer email+password auth
      if (password) {
        const { data: signInData, error: signInErr } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        if (signInErr?.message?.toLowerCase().includes("invalid login")) {
          // Try sign up (idempotent UX). If user exists, error will occur; we fallback to sign-in above.
          const { data: signUpData, error: signUpErr } =
            await supabase.auth.signUp({ email, password });
          if (signUpErr) throw signUpErr;
          const user = signUpData.user;
          if (user) {
            await supabase
              .from("users")
              .upsert({ id: user.id, email: user.email ?? "" })
              .select("id")
              .single();
            router.replace("/chat");
            return;
          }
        }
        if (signInErr) throw signInErr;
        const user = signInData.user;
        if (user) {
          await supabase
            .from("users")
            .upsert({ id: user.id, email: user.email ?? "" })
            .select("id")
            .single();
          router.replace("/chat");
          return;
        }
      } else {
        // Fallback: magic link
        const redirectTo = `${window.location.origin}/login`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
        });
        if (error) throw error;
        setStatus("Check your email for the magic link.");
      }
    } catch (err: unknown) {
      const message = ((): string => {
        if (typeof err === "object" && err !== null && "message" in err) {
          const m = (err as { message?: unknown }).message;
          return typeof m === "string" ? m : "Failed to send magic link";
        }
        return "Failed to send magic link";
      })();
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] max-w-md mx-auto w-full p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white">Login</h1>
      <form onSubmit={submit} className="flex flex-col gap-2 w-full">
        <input
          className="flex-1 h-11 rounded-md bg-[#23272F] text-white border border-white/15 px-3 outline-none focus:ring-2 focus:ring-white/20"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className="flex-1 h-11 rounded-md bg-[#23272F] text-white border border-white/15 px-3 outline-none focus:ring-2 focus:ring-white/20"
          type="password"
          placeholder="Password (leave empty to use magic link)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="h-11 px-4 rounded-md bg-white/10 text-white hover:bg-white/15 disabled:opacity-60"
          disabled={loading || !email}
        >
          {password ? "Sign in / Sign up" : "Send magic link"}
        </button>
      </form>
      {status && <p className="text-sm text-white/70">{status}</p>}
    </div>
  );
}
