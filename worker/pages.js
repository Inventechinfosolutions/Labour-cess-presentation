const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const shell = (title, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${esc(title)} · Inventech Demos</title>
<link rel="icon" type="image/png" href="/brand/favicon.png" />
<style>
  :root { --ink: #0f172a; --muted: #64748b; --line: #e2e8f0; --accent: #2563eb; --ease: cubic-bezier(0.22, 1, 0.36, 1); }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 32px 18px; font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--ink);
    background: radial-gradient(1000px 520px at 10% -10%, #dbeafe 0%, transparent 60%), radial-gradient(800px 460px at 100% 0%, #ede9fe 0%, transparent 55%), #f8fafc; }
  .card { width: min(100%, 420px); background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 34px 30px; box-shadow: 0 24px 48px -28px rgb(15 23 42 / 0.35); animation: rise 0.7s var(--ease) both; }
  .wide { width: min(100%, 860px); }
  @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  .brand { display: block; height: 44px; width: auto; margin: 0 0 22px; }
  .kicker { font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); }
  h1 { font-size: 24px; margin: 8px 0 6px; letter-spacing: -0.01em; }
  p { color: var(--muted); line-height: 1.55; margin: 0 0 22px; font-size: 15px; }
  label { display: block; font-size: 13px; font-weight: 600; margin: 0 0 6px; }
  input { width: 100%; padding: 13px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font: inherit; font-size: 16px; margin-bottom: 16px; transition: border-color 0.3s, box-shadow 0.3s; }
  input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px rgb(37 99 235 / 0.12); }
  input.pin { text-align: center; font-size: 28px; letter-spacing: 0.5em; padding-left: calc(14px + 0.5em); font-variant-numeric: tabular-nums; }
  button, .btn { display: inline-flex; justify-content: center; align-items: center; gap: 8px; width: 100%; padding: 13px 18px; border: 0; border-radius: 10px; background: var(--ink); color: #fff; font: inherit; font-weight: 600; font-size: 15px; cursor: pointer; text-decoration: none; transition: background 0.3s, transform 0.3s var(--ease); }
  button:hover, .btn:hover { background: var(--accent); transform: translateY(-1px); }
  .error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 10px 12px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
  .top { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 22px; }
  .top p { margin: 0; }
  .links { display: flex; gap: 16px; font-size: 14px; white-space: nowrap; }
  .links a { color: var(--accent); text-decoration: none; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 600; padding: 0 10px 10px; border-bottom: 1px solid var(--line); }
  td { padding: 14px 10px; border-bottom: 1px solid var(--line); vertical-align: middle; }
  td a { color: var(--accent); text-decoration: none; word-break: break-all; }
  .code { font: 600 18px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.12em; }
  .copy { width: auto; padding: 8px 12px; font-size: 13px; background: #f1f5f9; color: var(--ink); }
  .copy:hover { color: #fff; }
  .note { margin: 20px 0 0; font-size: 13px; }
  .designs { margin-top: 34px; padding-top: 26px; border-top: 1px solid var(--line); scroll-margin-top: 24px; }
  .designs h2 { font-size: 18px; margin: 0 0 4px; }
  .designs p { margin: 0 0 16px; font-size: 14px; }
  .ok { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 10px 12px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; animation: rise 0.5s var(--ease) both; }
  .toggles { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; margin-bottom: 18px; }
  .toggle { position: relative; display: flex; align-items: center; gap: 12px; margin: 0; padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; cursor: pointer; font-weight: 400; transition: border-color 0.3s, background 0.3s; }
  .toggle:hover { border-color: var(--accent); background: #f8fafc; }
  .toggle input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; padding: 0; }
  .track { position: relative; flex: none; width: 38px; height: 22px; border-radius: 999px; background: #cbd5e1; transition: background 0.3s var(--ease); }
  .track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgb(15 23 42 / 0.3); transition: transform 0.3s var(--ease); }
  .toggle input:checked + .track { background: #16a34a; }
  .toggle input:checked + .track::after { transform: translateX(16px); }
  .toggle input:focus-visible + .track { box-shadow: 0 0 0 4px rgb(37 99 235 / 0.2); }
  .tname { display: block; font-weight: 600; font-size: 14px; }
  .tstate { display: block; font-size: 12.5px; color: var(--muted); }
  .tstate::before { content: "Hidden from clients"; color: #b91c1c; }
  .toggle input:checked ~ span .tstate::before { content: "Visible to clients"; color: #15803d; }
  .toggle a { margin-left: auto; font-size: 13px; color: var(--accent); text-decoration: none; font-weight: 600; }
  .row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .row button { width: auto; }
  .ghost { background: #f1f5f9; color: var(--ink); }
  @media (max-width: 680px) {
    thead { display: none; }
    tr { display: grid; gap: 6px; padding: 14px 0; border-bottom: 1px solid var(--line); }
    td { padding: 0; border: 0; }
    .top { flex-direction: column; }
  }
</style>
</head>
<body>${body}</body>
</html>`;

const error = (msg) => (msg ? `<div class="error" role="alert">${esc(msg)}</div>` : "");

export const loginPage = (next = "/", msg = "") =>
  shell(
    "Admin sign in",
    `<form class="card" method="post" action="/login">
      <img class="brand" src="/brand/inventech-logo.png" alt="Inventech Info Solutions" />
      <div class="kicker">Demo sites</div>
      <h1>Admin sign in</h1>
      <p>Sign in to see every demo and the share PINs.</p>
      ${error(msg)}
      <input type="hidden" name="next" value="${esc(next)}" />
      <label for="u">Username</label>
      <input id="u" name="username" autocomplete="username" required autofocus />
      <label for="p">Password</label>
      <input id="p" name="password" type="password" autocomplete="current-password" required />
      <button type="submit">Sign in</button>
    </form>`,
  );

export const pinPage = (demo, msg = "") =>
  shell(
    demo.name,
    `<form class="card" method="post">
      <img class="brand" src="/brand/inventech-logo.png" alt="Inventech Info Solutions" />
      <div class="kicker">Private preview</div>
      <h1>${esc(demo.name)}</h1>
      <p>Enter the 6-digit PIN you received to view this demo.</p>
      ${error(msg)}
      <label for="pin">PIN</label>
      <input id="pin" class="pin" name="pin" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required autofocus />
      <button type="submit">View demo</button>
    </form>`,
  );

const designsSection = (demo, origin, { saved, storage }) => {
  const toggles = demo.designs
    .map(
      (d) => `<label class="toggle">
        <input type="checkbox" name="show" value="${esc(d.id)}" ${demo.hidden.includes(d.id) ? "" : "checked"} ${storage ? "" : "disabled"} />
        <span class="track" aria-hidden="true"></span>
        <span><span class="tname">${esc(d.name)} · ${esc(d.style)}</span><span class="tstate"></span></span>
        <a href="${esc(`${origin}/${demo.id}${d.path ? `${d.path}?view=admin` : `/?theme=${d.id}&view=admin`}`)}" target="_blank" rel="noopener">Open</a>
      </label>`,
    )
    .join("");
  return `<form class="designs" id="designs-${esc(demo.id)}" method="post" action="/admin/designs">
      <h2>${esc(demo.name)}: designs</h2>
      <p>Switch a design off to hide it from clients. It disappears from their gallery or theme menu, and its link takes them back to the start. You still see everything while signed in, with hidden ones marked. Open a link in the table above to preview what a client sees.</p>
      ${saved === demo.id ? `<div class="ok" role="status">Saved. Clients see the change within a minute.</div>` : ""}
      ${storage ? "" : `<div class="error" role="alert">Storage isn't set up. Add the SETTINGS KV binding in wrangler.jsonc and deploy.</div>`}
      <input type="hidden" name="demo" value="${esc(demo.id)}" />
      <div class="toggles">${toggles}</div>
      <div class="row">
        <button type="submit" ${storage ? "" : "disabled"}>Save</button>
        <button type="button" class="ghost" data-all="true" ${storage ? "" : "disabled"}>Show all</button>
        <button type="button" class="ghost" data-all="false" ${storage ? "" : "disabled"}>Hide all</button>
      </div>
    </form>`;
};

export const adminPage = (demos, origin, options = {}) =>
  shell(
    "Share links",
    `<main class="card wide">
      <div class="top">
        <div><img class="brand" src="/brand/inventech-logo.png" alt="Inventech Info Solutions" /><div class="kicker">Admin</div><h1>Share links &amp; PINs</h1><p>Send a client the link and PIN for one demo. The PIN unlocks only that demo. Opening a link here previews the demo as a client sees it.</p></div>
        <div class="links"><a href="/">All demos</a><a href="/logout">Sign out</a></div>
      </div>
      <table>
        <thead><tr><th>Demo</th><th>Link</th><th>PIN</th><th></th></tr></thead>
        <tbody>
          ${demos
            .map((d) => {
              const link = `${origin}/${d.id}/`;
              const message = `${d.name}\nLink: ${link}\nPIN: ${d.pin}`;
              return `<tr>
                <td><strong>${esc(d.name)}</strong></td>
                <td><a href="${esc(`${link}?view=client`)}" target="_blank" rel="noopener" title="Opens as a client sees it">${esc(link)}</a></td>
                <td class="code">${esc(d.pin)}</td>
                <td><button class="copy" type="button" data-copy="${esc(message)}">Copy message</button></td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
      <p class="note">To change a demo's PIN, raise its <code>pinVersion</code> in <code>worker/demos.js</code> and deploy. The old PIN stops working and clients it unlocked must enter the new one.</p>
      ${demos
        .filter((d) => d.designs)
        .map((d) => designsSection(d, origin, options))
        .join("")}
    </main>
    <script>
      document.querySelectorAll("[data-all]").forEach((b) =>
        b.addEventListener("click", () =>
          b.form.querySelectorAll('input[name="show"]').forEach((c) => (c.checked = b.dataset.all === "true")),
        ),
      );
      document.querySelectorAll("[data-copy]").forEach((b) =>
        b.addEventListener("click", async () => {
          await navigator.clipboard.writeText(b.dataset.copy);
          const label = b.textContent;
          b.textContent = "Copied ✓";
          setTimeout(() => (b.textContent = label), 1600);
        }),
      );
    </script>`,
  );

export const messagePage = (title, text) =>
  shell(title, `<main class="card"><img class="brand" src="/brand/inventech-logo.png" alt="Inventech Info Solutions" /><h1>${esc(title)}</h1><p>${esc(text)}</p></main>`);
