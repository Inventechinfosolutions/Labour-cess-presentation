/** CESS visual system — the only colours used across the deck. */

export const HEX = {
  navy: "#0b1f4a",
  navyDeep: "#071433",
  navyMid: "#12305f",
  navyInk: "#050d22",
  teal: "#0e9aa7",
  tealBright: "#14c4d4",
  gold: "#f0c14a",
  goldDeep: "#b8872b",
  goldInk: "#3b2a08",
  goldSoft: "#f8efd6",
  risk: "#c4453c",
  riskSoft: "#f7e9e7",
  riskInk: "#7a221c",
  ok: "#0e8a72",
  okSoft: "#e5f5f1",
  okInk: "#085c4c",
  mist: "#e8eef6",
  ink: "#14233f",
  paper: "#ffffff",
  muted: "#5c6b84",
  port1: "#14c4d4",
  port2: "#0e9aa7",
  port3: "#f0c14a",
  port4: "#1a4e8a",
  port5: "#0a7c86",
  port6: "#c4962e",
} as const;

export const PIN = {
  active: HEX.teal,
  ok: HEX.ok,
  pending: HEX.goldDeep,
  risk: HEX.risk,
  navy: HEX.port4,
} as const;

export const PORT_ACCENT = [
  "bg-port-1 text-port-1",
  "bg-port-2 text-port-2",
  "bg-port-3 text-port-3",
  "bg-port-4 text-port-4",
  "bg-port-5 text-port-5",
  "bg-port-6 text-port-6",
] as const;

export const GOLD_ACCENT = "bg-gold text-gold";
