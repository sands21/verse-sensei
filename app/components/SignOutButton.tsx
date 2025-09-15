"use client";

import supabase from "@/lib/supabaseClient";

export default function SignOutButton() {
  return (
    <button
      className="text-xs text-white/70 hover:text-white bg-white/10 px-2 py-1 rounded"
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
    >
      Sign out
    </button>
  );
}
