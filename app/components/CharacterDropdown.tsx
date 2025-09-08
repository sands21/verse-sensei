"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

type Character = {
  id: string;
  name: string;
};

type Props = {
  universeId: string | undefined;
  value?: string;
  onChange?: (id: string) => void;
};

export default function CharacterDropdown({
  universeId,
  value,
  onChange,
}: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [internalSelectedId, setInternalSelectedId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setError("");
      setCharacters([]);
      setInternalSelectedId("");
      if (!universeId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("characters")
        .select("id, name")
        .eq("universe_id", universeId)
        .order("name", { ascending: true });
      if (!isMounted) return;
      if (error) {
        setError(error.message);
      } else {
        setCharacters(data ?? []);
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [universeId]);

  const selectedId = value ?? internalSelectedId;
  const setSelectedId = onChange ?? setInternalSelectedId;

  return (
    <div className="w-full max-w-sm">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Character
      </label>
      <select
        className="w-full h-10 rounded-md bg-[#23272F] text-white border border-white/15 px-3 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        disabled={!universeId || loading}
      >
        <option value="" disabled>
          {!universeId
            ? "Select a universe first"
            : loading
            ? "Loading..."
            : "Select a character"}
        </option>
        {characters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
