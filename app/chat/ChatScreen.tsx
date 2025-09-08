"use client";

import { useSearchParams } from "next/navigation";
import ChatPanel from "../components/ChatPanel";

export default function ChatScreen() {
  const params = useSearchParams();
  const conversationId = params.get("conversation") ?? undefined;
  return <ChatPanel conversationId={conversationId} />;
}
