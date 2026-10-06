import { HEX } from "@/lib/palette";
import { PROJECTS } from "@/lib/maps";

const MAP_CENTER: [number, number] = [12.9716, 77.5946];
const MAP_ZOOM = 12;

function mercator(lat: number, lng: number): [number, number] {
  const scale = 256 * 2 ** MAP_ZOOM;
  const x = ((lng + 180) / 360) * scale;
  const s = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale;
  return [x, y];
}

const ORIGIN = mercator(MAP_CENTER[0], MAP_CENTER[1]);

export function xy(lat: number, lng: number): [number, number] {
  const [x, y] = mercator(lat, lng);
  return [400 + (x - ORIGIN[0]), 400 + (y - ORIGIN[1])];
}

export function linePath(coords: [number, number][], close = false) {
  const d = coords
    .map(([lat, lng], i) => {
      const [x, y] = xy(lat, lng);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("");
  return close ? `${d}Z` : d;
}

function ovalPts(cx: number, cy: number, rx: number, ry: number, n: number, noise: number, seed: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const j =
      1 +
      Math.sin(t * 3 + seed) * noise +
      Math.cos(t * 5 + seed * 1.7) * noise * 0.48 +
      Math.sin(t * 9 + seed * 0.4) * noise * 0.18;
    pts.push([cx + Math.cos(t) * rx * j, cy + Math.sin(t) * ry * j]);
  }
  return pts;
}

function toPath(pts: [number, number][]) {
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
}

export const DISTRICT = toPath(ovalPts(400, 400, 330, 318, 48, 0.08, 1.15));
export const ULB = toPath(ovalPts(398, 402, 248, 228, 44, 0.06, 2.05));
export const TERRITORY = toPath(ovalPts(535, 392, 175, 248, 42, 0.14, 0.55));
export const WEST = toPath(ovalPts(268, 408, 168, 240, 36, 0.08, 1.8));
export const WARDS = ["M250 400 L540 404", "M398 210 L410 590", "M280 280 L530 530", "M530 250 L300 540"];

/** East Zone ring geometry — used for survey ticks and focus label. */
export const TERRITORY_RING = { cx: 535, cy: 392, rx: 175, ry: 248, noise: 0.14, seed: 0.55 } as const;

/** Cardinal survey brackets along the East Zone boundary. */
export function territoryRingTicks(count = 8): { x1: number; y1: number; x2: number; y2: number; major: boolean }[] {
  const { cx, cy, rx, ry, noise, seed } = TERRITORY_RING;
  const ticks: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2 - Math.PI / 2;
    const j =
      1 +
      Math.sin(t * 3 + seed) * noise +
      Math.cos(t * 5 + seed * 1.7) * noise * 0.48 +
      Math.sin(t * 9 + seed * 0.4) * noise * 0.18;
    const ox = Math.cos(t);
    const oy = Math.sin(t);
    const major = i % 2 === 0;
    const inner = major ? 0.88 : 0.93;
    const outer = major ? 1.08 : 1.04;
    ticks.push({
      x1: cx + ox * rx * j * inner,
      y1: cy + oy * ry * j * inner,
      x2: cx + ox * rx * j * outer,
      y2: cy + oy * ry * j * outer,
      major,
    });
  }
  return ticks;
}

export const SITES = PROJECTS.map((project) => {
  const [x, y] = xy(project.latlng[0], project.latlng[1]);
  const short = project.id === "abc" ? "ABC" : project.name.split(" ")[0];
  return { id: project.id, name: short, x, y, color: project.color, status: project.status, fullName: project.name };
});

const INFRA_LL: { lat: number; lng: number; kind: "power" | "water" | "stp" | "drain" | "civic"; label: string }[] = [
  { lat: 13.0358, lng: 77.597, kind: "power", label: "110 kV Hebbal" },
  { lat: 12.957, lng: 77.586, kind: "stp", label: "K&C Valley STP" },
  { lat: 12.96, lng: 77.652, kind: "water", label: "CWSS reservoir" },
  { lat: 12.942, lng: 77.542, kind: "drain", label: "Vrishabhavathi" },
  { lat: 12.969, lng: 77.74, kind: "civic", label: "Whitefield civic" },
];

export const INFRA = INFRA_LL.map((node) => {
  const [x, y] = xy(node.lat, node.lng);
  return { ...node, x, y };
});

export const PARCELS = [
  { id: "c1", label: "Commercial", d: linePath([[12.966, 77.688], [12.966, 77.706], [12.954, 77.706], [12.954, 77.688]], true) },
  { id: "c2", label: "Commercial", d: linePath([[12.968, 77.708], [12.968, 77.722], [12.956, 77.722], [12.956, 77.708]], true) },
  { id: "m1", label: "Mixed use", d: linePath([[12.954, 77.686], [12.954, 77.704], [12.942, 77.704], [12.942, 77.686]], true) },
  { id: "r1", label: "Residential", d: linePath([[12.944, 77.698], [12.944, 77.716], [12.932, 77.716], [12.932, 77.698]], true) },
];

export const ABC_FOOTPRINT = linePath(
  [
    [12.9632, 77.6958],
    [12.9632, 77.6988],
    [12.96, 77.6988],
    [12.96, 77.6958],
  ],
  true,
);

export const ROADS: { id: string; w: number; label: string; labelAt: [number, number]; d: string }[] = [
  {
    id: "orr",
    w: 2.5,
    label: "Outer Ring Road",
    labelAt: [12.956, 77.701],
    d: linePath([
      [13.0456, 77.5902],
      [13.0472, 77.6055],
      [13.0408, 77.6255],
      [13.032, 77.665],
      [13.0165, 77.6945],
      [12.997, 77.702],
      [12.969, 77.7045],
      [12.9562, 77.7013],
      [12.939, 77.697],
      [12.927, 77.678],
      [12.92, 77.663],
      [12.915, 77.649],
      [12.912, 77.638],
      [12.9173, 77.6226],
      [12.91, 77.605],
      [12.905, 77.588],
      [12.906, 77.57],
      [12.924, 77.548],
      [12.932, 77.535],
      [12.9455, 77.521],
      [12.958, 77.512],
      [12.978, 77.508],
      [12.991, 77.5065],
      [13.018, 77.511],
      [13.029, 77.5195],
      [13.042, 77.541],
      [13.0465, 77.554],
      [13.047, 77.572],
      [13.0456, 77.5902],
    ]),
  },
  {
    id: "airport",
    w: 2.1,
    label: "Airport Rd",
    labelAt: [13.015, 77.588],
    d: linePath([
      [12.978, 77.592],
      [12.991, 77.59],
      [13.0005, 77.585],
      [13.015, 77.588],
      [13.028, 77.59],
      [13.0456, 77.5902],
    ]),
  },
  {
    id: "hosur",
    w: 2.1,
    label: "Hosur Rd",
    labelAt: [12.935, 77.615],
    d: linePath([
      [12.971, 77.605],
      [12.96, 77.61],
      [12.95, 77.608],
      [12.935, 77.615],
      [12.9173, 77.6226],
    ]),
  },
  {
    id: "madras",
    w: 2.0,
    label: "Old Madras Rd",
    labelAt: [12.99, 77.652],
    d: linePath([
      [12.978, 77.62],
      [12.981, 77.628],
      [12.978, 77.641],
      [12.986, 77.652],
      [13.005, 77.672],
      [13.0165, 77.6945],
    ]),
  },
  {
    id: "mysore",
    w: 2.0,
    label: "Mysore Rd",
    labelAt: [12.952, 77.545],
    d: linePath([
      [12.965, 77.574],
      [12.958, 77.573],
      [12.952, 77.545],
      [12.9455, 77.521],
    ]),
  },
];

export const CESS_VALUES = [
  { id: "registered", label: "Registered", color: HEX.tealBright, tone: "idle" as const },
  { id: "assessment", label: "Assessment pending", color: HEX.goldDeep, tone: "wait" as const },
  { id: "demand", label: "Demand generated", color: HEX.risk, tone: "warn" as const },
  { id: "payment", label: "Payment pending", color: HEX.gold, tone: "wait" as const },
  { id: "compliant", label: "Compliant", color: HEX.ok, tone: "ok" as const },
] as const;

export type CessValueId = (typeof CESS_VALUES)[number]["id"];

const CESS_SITES_LL: { id: string; name: string; fullName: string; lat: number; lng: number; status: CessValueId }[] = [
  { id: "abc", name: "ABC", fullName: "ABC Commercial Complex", lat: 12.9616, lng: 77.6973, status: "assessment" },
  { id: "kora", name: "Koramangala", fullName: "Koramangala Tower", lat: 12.9354, lng: 77.6245, status: "assessment" },
  { id: "yesh", name: "Yeshwanthpur", fullName: "Yeshwanthpur Hub", lat: 13.028, lng: 77.54, status: "assessment" },
  { id: "jaya", name: "Jayanagar", fullName: "Jayanagar Precinct", lat: 12.925, lng: 77.583, status: "registered" },
  { id: "tech", name: "Tech Park", fullName: "Tech Park Phase 2", lat: 12.935, lng: 77.695, status: "registered" },
  { id: "white", name: "Whitefield", fullName: "Whitefield IT Block", lat: 12.9698, lng: 77.7499, status: "registered" },
  { id: "hebb", name: "Hebbal", fullName: "Hebbal Gateway", lat: 13.0358, lng: 77.597, status: "registered" },
  { id: "maple", name: "Maple", fullName: "Maple Apartments", lat: 12.927, lng: 77.518, status: "demand" },
  { id: "bomm", name: "Bommanahalli", fullName: "Bommanahalli Rise", lat: 12.899, lng: 77.63, status: "demand" },
  { id: "raja", name: "Rajajinagar", fullName: "Rajajinagar Square", lat: 12.991, lng: 77.554, status: "demand" },
  { id: "orion", name: "Orion", fullName: "Orion Mall Expansion", lat: 13.011, lng: 77.555, status: "payment" },
  { id: "bell", name: "Bellandur", fullName: "Bellandur Lake View", lat: 12.93, lng: 77.678, status: "payment" },
  { id: "hsr", name: "HSR", fullName: "HSR Layout Block", lat: 12.912, lng: 77.638, status: "payment" },
  { id: "mall", name: "Malleswaram", fullName: "Malleswaram Court", lat: 13.006, lng: 77.569, status: "payment" },
  { id: "vija", name: "Vijayanagar", fullName: "Vijayanagar Heights", lat: 12.971, lng: 77.538, status: "compliant" },
  { id: "sky", name: "Skyline", fullName: "Skyline Residency", lat: 13.035, lng: 77.571, status: "compliant" },
  { id: "indi", name: "Indiranagar", fullName: "Indiranagar Arcade", lat: 12.978, lng: 77.641, status: "compliant" },
  { id: "jp", name: "JP Nagar", fullName: "JP Nagar Enclave", lat: 12.906, lng: 77.585, status: "compliant" },
];

export const CESS_SITES = CESS_SITES_LL.map((site) => {
  const [x, y] = xy(site.lat, site.lng);
  const value = CESS_VALUES.find((item) => item.id === site.status) ?? CESS_VALUES[0];
  return { ...site, x, y, color: value.color, label: value.label, tone: value.tone };
});

export const CESS_STATUS: Record<string, { label: string; color: string; tone: "ok" | "wait" | "idle" | "warn" }> = Object.fromEntries(
  CESS_SITES.filter((site) => ["abc", "sky", "tech", "orion", "maple"].includes(site.id)).map((site) => [
    site.id,
    { label: site.label, color: site.color, tone: site.tone },
  ]),
);

export const GPS_VISITS = [
  { lat: 12.9616, lng: 77.6973, label: "16 Sep · 10:24" },
  { lat: 12.9628, lng: 77.696, label: "09 Sep" },
  { lat: 12.9604, lng: 77.6984, label: "02 Sep" },
];
