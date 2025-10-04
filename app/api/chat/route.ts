import supabaseAdmin from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // Verify Supabase JWT from Authorization header if provided
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      if (supabaseUrl) {
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
        const client = createClient(supabaseUrl, anon, {
          auth: { persistSession: false },
        });
        const { data } = await client.auth.getUser(token);
        userId = data.user?.id ?? null;
      }
    }

    const body = await req.json();
    const { conversationId, text, characterId } = body || {};
    if (typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Invalid 'text'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Persona assembly (server-only)
    let persona: {
      characterId?: string;
      characterName?: string;
      universeName?: string;
    } = {};
    let personaConfig: unknown = undefined;
    let historyCount = 0;

    if (!supabaseAdmin) {
      return new Response(
        JSON.stringify({
          error: "Server not configured: SUPABASE_SERVICE_ROLE_KEY missing",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (characterId) {
      const { data: character, error: charErr } = await supabaseAdmin
        .from("characters")
        .select("id, name, persona_config, universe_id")
        .eq("id", characterId)
        .single();
      if (charErr) {
        return new Response(JSON.stringify({ error: charErr.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { data: universe } = await supabaseAdmin
        .from("universes")
        .select("name")
        .eq("id", character.universe_id)
        .single();

      persona = {
        characterId: character.id,
        characterName: character.name,
        universeName: universe?.name,
      };
      personaConfig = character.persona_config ?? undefined;
    }

    let historyMessages: Array<{ role: string; content: string }> = [];
    if (conversationId) {
      const { data: history } = await supabaseAdmin
        .from("messages")
        .select("sender, content")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true })
        .limit(20);
      historyCount = history?.length ?? 0;
      historyMessages = (history ?? []).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content as string,
      }));
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openrouterModel = process.env.OPENROUTER_MODEL;
    let reply = `Got it: ${text.slice(0, 200)}`;

    if (openrouterKey) {
      const systemParts: string[] = [];
      if (persona.characterName)
        systemParts.push(
          `You are ${persona.characterName}${
            persona.universeName ? ` from ${persona.universeName}` : ""
          }. Reply in-character.`
        );
      if (personaConfig)
        systemParts.push(
          `Persona config: ${JSON.stringify(personaConfig).slice(0, 4000)}`
        );
      const systemPrompt = systemParts.join("\n\n");

      const messages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...historyMessages,
        { role: "user", content: text },
      ];

      try {
        const res = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openrouterKey}`,
              "X-Title": "helix",
            },
            body: JSON.stringify({
              model: openrouterModel,
              messages,
              temperature: 0.7,
            }),
          }
        );
        if (res.ok) {
          const json = await res.json();
          reply = json?.choices?.[0]?.message?.content ?? reply;
        }
      } catch {}
    }

    // Persist AI reply if conversationId is provided, and capture id
    let aiMessageId: string | null = null;
    if (conversationId) {
      try {
        const { data: aiRow } = await supabaseAdmin
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender: "ai",
            content: reply,
            // associate message with user if we have it (optional)
            ...(userId ? { user_id: userId } : {}),
          })
          .select("id")
          .single();
        aiMessageId = (aiRow?.id as string) ?? null;
      } catch {}
    }

    return new Response(
      JSON.stringify({
        ok: true,
        conversationId: conversationId ?? null,
        reply,
        persona,
        historyCount,
        aiMessageId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
