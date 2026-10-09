// Hidden designs live in the SETTINGS KV namespace as `hidden:<demo id>` -> [design id, ...].
// KV is eventually consistent, so a change can take up to a minute to reach every region.
const key = (demo) => `hidden:${demo.id}`;

export async function hiddenDesigns(env, demo) {
  if (!demo?.designs || !env.SETTINGS) return [];
  const list = await env.SETTINGS.get(key(demo), "json");
  return Array.isArray(list) ? list.filter((id) => demo.designs.some((d) => d.id === id)) : [];
}

export async function saveHiddenDesigns(env, demo, shown) {
  const hidden = demo.designs.map((d) => d.id).filter((id) => !shown.includes(id));
  await env.SETTINGS.put(key(demo), JSON.stringify(hidden));
}

export const blockedPage = (demo, hidden, page) =>
  demo.designs.some((d) => d.path && hidden.includes(d.id) && (page === d.path || page.startsWith(`${d.path}/`)));
