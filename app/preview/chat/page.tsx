import ChatPreview from "@/app/components/chat-brutal/ChatPreview";

// Temporary preview of the new neo-brutalist chat (paper canvas), built section by
// section like the landing was. Static/scripted, no backend. The real dark /chat
// is untouched; this never swaps in until the whole paper rollout. See CLAUDE.md §5.
export default function ChatPreviewPage() {
  return <ChatPreview />;
}
