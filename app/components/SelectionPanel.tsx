"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UniverseDropdown from "./UniverseDropdown";
import CharacterDropdown from "./CharacterDropdown";

export default function SelectionPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const [universeId, setUniverseId] = useState<string>("");
  const [characterId, setCharacterId] = useState<string>("");

  return (
    <div className="w-full flex flex-col gap-4">
      <UniverseDropdown
        value={universeId}
        onChange={(id) => {
          setUniverseId(id);
          setCharacterId("");
        }}
      />
      <CharacterDropdown
        universeId={universeId || undefined}
        value={characterId}
        onChange={setCharacterId}
      />
      <div>
        <button
          className="h-10 px-3 rounded-md bg-white/10 text-white hover:bg-white/15 disabled:opacity-60"
          disabled={!characterId}
          onClick={() => {
            if (!characterId) return;
            const conv = params.get("conversation");
            const qs = conv
              ? `conversation=${conv}&character=${characterId}`
              : `character=${characterId}`;
            router.push(`/chat?${qs}`);
          }}
        >
          Start chat
        </button>
      </div>
      <div className="text-sm text-gray-300/80">
        <span className="mr-4">Universe: {universeId || "—"}</span>
        <span>Character: {characterId || "—"}</span>
      </div>
    </div>
  );
}
