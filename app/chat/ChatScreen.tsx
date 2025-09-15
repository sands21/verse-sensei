"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import ChatPanel from "../components/ChatPanel";

export default function ChatScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const conversationId = params.get("conversation") ?? undefined;
  const characterId = params.get("character") ?? undefined;

  useEffect(() => {
    const ensureConversation = async () => {
      if (conversationId) return;
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      const { data } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.id) {
        const char = characterId ? `&character=${characterId}` : "";
        router.replace(`?conversation=${data.id}${char}`);
      }
    };
    void ensureConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, characterId]);
  return (
    <ChatPanel conversationId={conversationId} characterId={characterId} />
  );
}
