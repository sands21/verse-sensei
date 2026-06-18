const DEFAULT_REDIRECT = "/chat";
const AUTH_CALLBACK_PATH = "/auth/callback";

const AUTH_HASH_KEYS = [
  "access_token",
  "refresh_token",
  "provider_token",
  "expires_at",
  "expires_in",
  "token_type",
  "error",
  "error_code",
  "error_description",
];

export function getSafeRedirect(
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT
) {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(trimmed, "https://app.local");
    if (url.origin !== "https://app.local") return fallback;
    if (url.pathname === AUTH_CALLBACK_PATH) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function getAuthCallbackUrl(origin: string, redirect: string) {
  const url = new URL(AUTH_CALLBACK_PATH, origin);
  url.searchParams.set("redirect", getSafeRedirect(redirect));
  return url.toString();
}

export function hasSupabaseAuthHash(hash: string) {
  if (!hash.startsWith("#")) return false;

  const params = new URLSearchParams(hash.slice(1));
  return AUTH_HASH_KEYS.some((key) => params.has(key));
}

export function stripSupabaseAuthHash() {
  if (
    typeof window === "undefined" ||
    !hasSupabaseAuthHash(window.location.hash)
  ) {
    return;
  }

  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}`
  );
}
