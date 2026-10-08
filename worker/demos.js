// Every demo is served under /<id>/ and unlocked separately with its own PIN.
// Bump `pinVersion` to issue a new PIN for a demo: the old PIN, and every client
// it unlocked, stop working after the next deploy.
export const DEMOS = [
  { id: "labour-cess", name: "Labour CESS Tracking & Monitoring System", pinVersion: 1 },
  { id: "global-connect", name: "Global Connect", pinVersion: 1, spa: true },
  { id: "ksic", name: "KSIC · Design Gallery", pinVersion: 1 },
];
