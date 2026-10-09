import { DEMOS } from "./demos.js";
import { clearCookie, pinFor, readSession, safeEqual, scopeFor, sessionCookie } from "./auth.js";
import { adminPage, loginPage, messagePage, pinPage } from "./pages.js";
import { blockedPage, hiddenDesigns, saveHiddenDesigns } from "./settings.js";

const ADMIN_DAYS = 7;
const CLIENT_DAYS = 30;

const html = (body, status = 200, headers = {}) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...headers },
  });
const redirect = (to, headers = {}) => new Response(null, { status: 303, headers: { Location: to, "Cache-Control": "no-store", ...headers } });
const safeNext = (next) => (typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/");

// Admins can preview a demo exactly as a client sees it: `?view=client` turns it on, `?view=admin` turns it off.
const clientView = (request) => /(?:^|;\s*)demo_view=client(?:;|$)/.test(request.headers.get("Cookie") || "");
const viewCookie = (view) => `demo_view=${view}; Path=/; HttpOnly; Secure; SameSite=Lax${view === "client" ? "" : "; Max-Age=0"}`;
const PREVIEW_BAR = `<div style="position:fixed;left:16px;bottom:16px;z-index:2147483647;display:flex;align-items:center;gap:10px;padding:6px 6px 6px 14px;border-radius:999px;background:#0f172a;color:#fff;font:600 13px/1.2 system-ui,-apple-system,sans-serif;box-shadow:0 8px 24px rgba(15,23,42,.3)">Client preview<a href="?view=admin" style="padding:6px 12px;border-radius:999px;background:#fff;color:#0f172a;text-decoration:none">Exit</a></div>`;

async function allowed(env, request, bucket) {
  if (!env.AUTH_LIMITER) return true;
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const { success } = await env.AUTH_LIMITER.limit({ key: `${bucket}:${ip}` });
  return success;
}

async function serve(request, env, demo, preview = false) {
  let res = await env.ASSETS.fetch(request);
  if (res.status === 404 && demo?.spa) res = await env.ASSETS.fetch(new Request(new URL(`/${demo.id}/`, request.url), request));
  res = new Response(res.body, res);
  res.headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  res.headers.set("X-Robots-Tag", "noindex");
  if (preview && res.headers.get("Content-Type")?.includes("text/html")) {
    res = new HTMLRewriter().on("body", { element: (body) => body.append(PREVIEW_BAR, { html: true }) }).transform(res);
  }
  return res;
}

async function login(request, env, session, url) {
  if (request.method !== "POST") return html(loginPage(safeNext(url.searchParams.get("next"))));
  const form = await request.formData();
  const next = safeNext(form.get("next"));
  if (!(await allowed(env, request, "login"))) return html(loginPage(next, "Too many attempts. Wait a minute and try again."), 429);
  const [userOk, passOk] = await Promise.all([
    safeEqual(form.get("username") ?? "", env.ADMIN_USER),
    safeEqual(form.get("password") ?? "", env.ADMIN_PASSWORD),
  ]);
  if (!userOk || !passOk) return html(loginPage(next, "Username or password is not correct."), 401);
  const cookie = await sessionCookie({ admin: true, scopes: session?.scopes ?? [] }, env.AUTH_SECRET, ADMIN_DAYS);
  return redirect(next, { "Set-Cookie": cookie });
}

async function saveDesigns(request, env) {
  if (request.method !== "POST" || !env.SETTINGS) return redirect("/admin");
  const form = await request.formData();
  const demo = DEMOS.find((d) => d.designs && d.id === form.get("demo"));
  if (!demo) return redirect("/admin");
  await saveHiddenDesigns(env, demo, form.getAll("show").map(String));
  return redirect(`/admin?saved=${encodeURIComponent(demo.id)}#designs-${demo.id}`);
}

async function unlock(request, env, session, demo, url) {
  if (!(await allowed(env, request, "pin"))) return html(pinPage(demo, "Too many attempts. Wait a minute and try again."), 429);
  const pin = String((await request.formData()).get("pin") ?? "").replace(/\D/g, "");
  if (!(await safeEqual(pin, await pinFor(env.AUTH_SECRET, demo)))) return html(pinPage(demo, "That PIN is not correct."), 401);
  const scopes = [...(session?.scopes ?? []).filter((s) => !s.startsWith(`${demo.id}:`)), scopeFor(demo)];
  const cookie = await sessionCookie({ admin: false, scopes }, env.AUTH_SECRET, CLIENT_DAYS);
  return redirect(url.pathname, { "Set-Cookie": cookie });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.startsWith("/brand/")) return serve(request, env, null);

    if (!env.ADMIN_USER || !env.ADMIN_PASSWORD || !env.AUTH_SECRET) {
      return html(messagePage("Not configured yet", "Set the ADMIN_USER, ADMIN_PASSWORD and AUTH_SECRET secrets on this Worker."), 503);
    }

    const session = await readSession(request, env.AUTH_SECRET);
    const isAdmin = session?.admin === true;
    const unlocked = (demo) => session?.scopes?.includes(scopeFor(demo));

    const view = url.searchParams.get("view");
    if (isAdmin && (view === "client" || view === "admin")) {
      url.searchParams.delete("view");
      return redirect(url.pathname + url.search, { "Set-Cookie": viewCookie(view) });
    }
    const preview = isAdmin && clientView(request);
    const asAdmin = isAdmin && !preview;

    if (path === "/login") return login(request, env, session, url);
    if (path === "/logout") return redirect("/login", { "Set-Cookie": clearCookie });

    if (path === "/admin") {
      if (!isAdmin) return redirect("/login?next=/admin");
      const demos = await Promise.all(
        DEMOS.map(async (d) => ({ ...d, pin: await pinFor(env.AUTH_SECRET, d), hidden: await hiddenDesigns(env, d) })),
      );
      return html(adminPage(demos, url.origin, { saved: url.searchParams.get("saved"), storage: Boolean(env.SETTINGS) }));
    }
    if (path === "/admin/designs") return isAdmin ? saveDesigns(request, env) : redirect("/login?next=/admin");

    const demo = DEMOS.find((d) => path === `/${d.id}` || path.startsWith(`/${d.id}/`));
    if (demo) {
      if (isAdmin || unlocked(demo)) {
        if (!demo.designs) return serve(request, env, demo, preview);
        const hidden = await hiddenDesigns(env, demo);
        const page = path.slice(demo.id.length + 1).replace(/\/+$/, "");
        if (page === "/visibility.json") {
          return Response.json({ hidden, admin: asAdmin }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
        }
        if (!asAdmin && blockedPage(demo, hidden, page)) return redirect(`/${demo.id}/`);
        return serve(request, env, demo, preview);
      }
      if (request.method === "POST") return unlock(request, env, session, demo, url);
      return html(pinPage(demo), 401);
    }

    if (isAdmin) return serve(request, env, null);
    const first = DEMOS.find(unlocked);
    if (first && path === "/") return redirect(`/${first.id}/`);
    return redirect(`/login?next=${encodeURIComponent(path)}`);
  },
};
