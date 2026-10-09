import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

const VITE_APPS = ["labour-cess", "global-connect", "bda"];
const STATIC_SITES = { KSIC: "ksic" };

const run = (cmd, cwd, env = {}) =>
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, ...env } });

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
cpSync("home", "dist", { recursive: true });

for (const app of VITE_APPS) {
  if (!existsSync(`${app}/node_modules`)) run("npm ci", app);
  run("npm run build", app, { DEMO_BASE: `/${app}/` });
  cpSync(`${app}/dist`, `dist/${app}`, { recursive: true });
}

for (const [folder, path] of Object.entries(STATIC_SITES)) {
  cpSync(folder, `dist/${path}`, { recursive: true });
}

console.log("\nBuilt all demos into dist/");
