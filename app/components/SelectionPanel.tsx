"use client";

import { useState } from "react";
import UniverseDropdown from "./UniverseDropdown";
import CharacterDropdown from "./CharacterDropdown";

export default function SelectionPanel() {
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
      <div className="text-sm text-gray-300/80">
        <span className="mr-4">Universe: {universeId || "—"}</span>
        <span>Character: {characterId || "—"}</span>
      </div>
    </div>
  );
}
