"use client";

import supabase from "@/lib/supabaseClient";

export default function SignOutButton() {
  return (
    <button
      className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 active:bg-white/25 px-2 py-1 rounded transition-all duration-150 cursor-pointer shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border/70"
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }}
    >
      Sign out
    </button>
  );
}
