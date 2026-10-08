const enc = new TextEncoder();
const COOKIE = "demo_session";
const keys = new Map();

async function hmac(secret, data) {
  let key = keys.get(secret);
  if (!key) {
    key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    keys.set(secret, key);
  }
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

const toB64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (text) => Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export async function safeEqual(a, b) {
  const [x, y] = await Promise.all([a, b].map((v) => crypto.subtle.digest("SHA-256", enc.encode(String(v)))));
  return crypto.subtle.timingSafeEqual(x, y);
}

export async function pinFor(secret, demo) {
  const h = await hmac(secret, `pin:${demo.id}:${demo.pinVersion}`);
  const n = ((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0;
  return String(n % 1_000_000).padStart(6, "0");
}

export const scopeFor = (demo) => `${demo.id}:${demo.pinVersion}`;

/** Returns `{ admin, scopes, exp }` from a valid signed cookie, or null. */
export async function readSession(request, secret) {
  const raw = (request.headers.get("Cookie") || "")
    .split(/;\s*/)
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return null;
  const [body, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!body || !sig) return null;
  if (!(await safeEqual(sig, toB64url(await hmac(secret, `session:${body}`))))) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export async function sessionCookie({ admin, scopes }, secret, days) {
  const body = toB64url(enc.encode(JSON.stringify({ admin, scopes, exp: Date.now() + days * 864e5 })));
  const sig = toB64url(await hmac(secret, `session:${body}`));
  return `${COOKIE}=${body}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${days * 86400}`;
}

export const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
