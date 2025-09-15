"use client";

type Props = {
  messageId?: string;
  onRate?: (rating: 1 | 5) => void;
};

export default function FeedbackBar({ messageId, onRate }: Props) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <button
        className="text-xs px-2 py-1 rounded bg-white/10 text-white hover:bg-white/15"
        onClick={() => onRate?.(5)}
        aria-label="Thumbs up"
      >
        👍
      </button>
      <button
        className="text-xs px-2 py-1 rounded bg-white/10 text-white hover:bg-white/15"
        onClick={() => onRate?.(1)}
        aria-label="Thumbs down"
      >
        👎
      </button>
    </div>
  );
}
