export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const authHealthUrl = `${url}/auth/v1/health`;
  try {
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(authHealthUrl, {
      cache: "no-store",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const text = await res.text();
    const ok = res.ok;
    return new Response(
      JSON.stringify({
        ok,
        service: "auth",
        status: ok ? "healthy" : "unhealthy",
        upstream: { status: res.status, body: text },
      }),
      {
        status: ok ? 200 : 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ ok: false, service: "auth", status: "unreachable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}
