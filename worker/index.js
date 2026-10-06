// Runs only when no static file matches the request.
const SPA_APPS = ["/global-connect/"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const app = SPA_APPS.find((prefix) => url.pathname.startsWith(prefix));
    if (app) return env.ASSETS.fetch(new Request(new URL(app, url), request));
    return new Response("Not found", { status: 404 });
  },
};
