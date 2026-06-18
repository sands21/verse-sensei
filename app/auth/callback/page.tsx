"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import {
  getSafeRedirect,
  hasSupabaseAuthHash,
  stripSupabaseAuthHash,
} from "@/lib/authRedirect";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [status, setStatus] = useState("Signing you in...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const finishSignIn = async () => {
      const redirect = getSafeRedirect(search.get("redirect"));
      const code = search.get("code");
      const authError =
        search.get("error_description") ||
        search.get("error_code") ||
        search.get("error");

      try {
        if (authError) {
          throw new Error(authError);
        }

        if (hasSupabaseAuthHash(window.location.hash)) {
          stripSupabaseAuthHash();
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        const user = data.user;
        if (!user) {
          router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
          return;
        }

        await supabase
          .from("users")
          .upsert({ id: user.id, email: user.email ?? "" })
          .select("id")
          .single();

        router.replace(redirect);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We could not complete sign-in. Please try again.";
        setStatus(message);
        setIsError(true);
      }
    };

    finishSignIn();

    return () => {
      isMounted = false;
    };
  }, [router, search]);

  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-3xl font-semibold">
          {isError ? "Sign-in failed" : "Almost there"}
        </h1>
        <p className={`mt-3 text-sm ${isError ? "text-red-400" : "text-muted"}`}>
          {status}
        </p>
        {isError && (
          <Link className="btn mt-6 inline-flex rounded-lg px-4 py-2" href="/login">
            Back to login
          </Link>
        )}
      </div>
    </main>
  );
}
