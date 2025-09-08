"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

type Universe = {
  id: string;
  name: string;
};

type Props = {
  value?: string;
  onChange?: (id: string) => void;
};

export default function UniverseDropdown({ value, onChange }: Props) {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [internalSelectedId, setInternalSelectedId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("universes")
        .select("id, name")
        .order("name", { ascending: true });
      if (!isMounted) return;
      if (error) {
        setError(error.message);
        setUniverses([]);
      } else {
        setUniverses(data ?? []);
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedId = value ?? internalSelectedId;
  const setSelectedId = onChange ?? setInternalSelectedId;

  return (
    <div className="w-full max-w-sm">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Universe
      </label>
      <select
        className="w-full h-10 rounded-md bg-[#23272F] text-white border border-white/15 px-3 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        disabled={loading}
      >
        <option value="" disabled>
          {loading ? "Loading..." : "Select a universe"}
        </option>
        {universes.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
