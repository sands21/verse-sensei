"use client";

type Props = {
  sender: "user" | "ai";
  text: string;
};

export default function ChatBubble({ sender, text }: Props) {
  const isUser = sender === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg px-3 py-2 max-w-[80%] text-sm leading-relaxed ${
          isUser
            ? "bg-white/10 text-white border border-white/10"
            : "bg-black/20 text-white border border-white/10"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
