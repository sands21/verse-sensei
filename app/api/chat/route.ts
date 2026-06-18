import supabaseAdmin from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { conversationId, text, characterId } = body || {};
    if (typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Invalid 'text'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (text.length > 4000) {
      return new Response(JSON.stringify({ error: "Message is too long" }), {
        status: 413,
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
    const admin = supabaseAdmin;

    let resolvedCharacterId =
      typeof characterId === "string" ? characterId : undefined;

    if (conversationId) {
      const { data: conversation, error: conversationErr } =
        await supabaseAdmin
          .from("conversations")
          .select("id, user_id, character_id")
          .eq("id", conversationId)
          .eq("user_id", userId)
          .single();

      if (conversationErr || !conversation) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      resolvedCharacterId = conversation.character_id;
    }

    if (resolvedCharacterId) {
      const { data: character, error: charErr } = await supabaseAdmin
        .from("characters")
        .select("id, name, persona_config, universe_id")
        .eq("id", resolvedCharacterId)
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

    const cleanModelOutput = (raw: string | null | undefined): string => {
      if (!raw) return "";
      let s = raw;
      s = s.replace(/<\|[^>]*\|>/g, ""); // remove meta tokens like <|begin_of_sentence|>
      s = s.replace(/\bbegin__of__sentence\b|\bend__of__sentence\b/gi, "");
      s = s.replace(/\s*\|\s*>?\s*$/g, "");
      s = s.replace(/[\t\x0B\f\r]+/g, " ");
      return s.trim();
    };

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openrouterModel = process.env.OPENROUTER_MODEL;
    let usedFallback = false;
    let reply = "";
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        const persistReply = async () => {
          const cleanedReply = cleanModelOutput(reply);
          let aiMessageId: string | null = null;

          if (conversationId && cleanedReply) {
            try {
              const { data: aiRow } = await admin
                .from("messages")
                .insert({
                  conversation_id: conversationId,
                  sender: "ai",
                  content: cleanedReply,
                  user_id: userId,
                })
                .select("id")
                .single();
              aiMessageId = (aiRow?.id as string) ?? null;
            } catch (error) {
              console.error("Failed to persist streamed AI reply", error);
            }
          }

          send("done", {
            ok: true,
            conversationId: conversationId ?? null,
            aiMessageId,
            usedFallback,
            historyCount,
            persona,
          });
        };

        try {
          if (!openrouterKey) {
            usedFallback = true;
            reply = `Got it: ${text.slice(0, 200)}`;
            send("delta", { text: reply });
            await persistReply();
            controller.close();
            return;
          }

          const systemParts: string[] = [];
          if (persona.characterName)
            systemParts.push(
              `You are ${persona.characterName}${
                persona.universeName ? ` from ${persona.universeName}` : ""
              }.
              ROLEPLAY STRICTLY in first person as this character. Stay fully in character.
              Use their voice, tone, slang, catchphrases, and worldview. Do not mention that you are an AI.
              If asked non-canon things, respond how the character plausibly would without breaking character.
              Keep responses concise with short paragraphs; use *italics* via asterisks for actions (e.g., *smiles*).
              Do not include any meta markers like <|begin_of_sentence|> or system messages.`
            );
          if (personaConfig)
            systemParts.push(
              `Persona profile (use faithfully): ${JSON.stringify(
                personaConfig
              ).slice(0, 6000)}

              When explaining complex topics:
              - Match the character's intelligence level (0–10).
              - Prefer examples from their knowledge_scope.
              - Follow explain_guidelines exactly.
              - If outside scope, say so in-character, then attempt a simple analogy using their world terms.`
            );
          const systemPrompt = systemParts.join("\n\n");

          const messages = [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            ...historyMessages,
            { role: "user", content: text },
          ];

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
                stream: true,
              }),
            }
          );

          if (!res.ok || !res.body) {
            usedFallback = true;
            const errText = await res.text().catch(() => "");
            console.error("OpenRouter error", res.status, errText);
            reply = `Got it: ${text.slice(0, 200)}`;
            send("delta", { text: reply });
            await persistReply();
            controller.close();
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;

              const data = trimmed.slice("data:".length).trim();
              if (!data || data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                const delta =
                  json?.choices?.[0]?.delta?.content ??
                  json?.choices?.[0]?.message?.content ??
                  "";

                if (typeof delta === "string" && delta) {
                  reply += delta;
                  send("delta", { text: delta });
                }
              } catch {
                // Ignore malformed provider chunks and keep the stream alive.
              }
            }
          }

          reply = cleanModelOutput(reply);
          await persistReply();
          controller.close();
        } catch (error) {
          console.error("Streaming chat failed", error);
          send("error", {
            error: "Sorry, I couldn't process your message. Please try again.",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
