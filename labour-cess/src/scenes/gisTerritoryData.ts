/**
 * Territory workspace data — Bengaluru Urban and Rural taluks in real
 * latitude / longitude, projects at real localities, the territory tree,
 * and the CESS statuses from assessment to closure.
 */

export type LatLng = [number, number];
export type TalukId = "blr-north" | "blr-south" | "blr-east" | "anekal" | "yelahanka" | "devanahalli" | "hoskote";
export type DistrictId = "blr-urban" | "blr-rural";

/** Web Mercator at zoom 10 — the common coordinate space for tiles and overlays. */
export const BASE_ZOOM = 10;
const WORLD = 256 * 2 ** BASE_ZOOM;

/** Tile zoom whose native scale is closest to a view of `s` screen px per zoom-10 px. */
export function tileZoomFor(s: number, min = 3, max = 16) {
  return Math.min(max, Math.max(min, BASE_ZOOM + Math.round(Math.log2(s))));
}

export function project([lat, lng]: LatLng): [number, number] {
  const sin = Math.sin((lat * Math.PI) / 180);
  return [((lng + 180) / 360) * WORLD, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * WORLD];
}

const V: Record<string, LatLng> = {
  o1: [13.22, 77.42],
  o2: [13.27, 77.55],
  o3: [13.24, 77.64],
  o4: [13.36, 77.66],
  o5: [13.38, 77.8],
  o6: [13.26, 77.9],
  o7: [13.15, 77.96],
  o8: [12.98, 77.95],
  o9: [12.93, 77.84],
  o10: [12.8, 77.86],
  o11: [12.64, 77.8],
  o12: [12.62, 77.64],
  o13: [12.72, 77.52],
  o14: [12.8, 77.44],
  o15: [12.9, 77.36],
  o16: [13.0, 77.37],
  o17: [13.1, 77.4],
  j1: [13.1, 77.6],
  j2: [13.12, 77.72],
  j3: [13.14, 77.82],
  j4: [13.0, 77.78],
  j5: [12.99, 77.615],
  j6: [12.975, 77.5],
  j7: [12.87, 77.74],
  j8: [12.89, 77.63],
  j9: [12.83, 77.5],
};

/** Smooth, position-only warp so shared borders stay identical on both sides. */
function warp([lat, lng]: LatLng): LatLng {
  return [
    lat + 0.005 * Math.sin(lng * 41 + lat * 17) + 0.0025 * Math.sin(lng * 97 - lat * 73 + 1.3),
    lng + 0.005 * Math.cos(lat * 39 - lng * 21) + 0.0025 * Math.cos(lat * 89 + lng * 61 + 0.7),
  ];
}

function ringPath(ids: string[]) {
  const pts: LatLng[] = [];
  ids.forEach((id, i) => {
    const a = V[id];
    const b = V[ids[(i + 1) % ids.length]];
    const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.012));
    for (let k = 0; k < n; k++) pts.push(warp([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]));
  });
  return `M${pts.map((p) => project(p).map((v) => v.toFixed(2)).join(",")).join("L")}Z`;
}

export const TALUKS: Record<
  TalukId,
  {
    label: string;
    district: DistrictId;
    color: string;
    ring: string[];
    labelAt: LatLng;
    localBody: string;
    inspector: string;
  }
> = {
  "blr-north": {
    label: "Bengaluru North",
    district: "blr-urban",
    color: "#1f6fe5",
    ring: ["o17", "j1", "j5", "j6", "o16"],
    labelAt: [13.085, 77.47],
    localBody: "BBMP West · Dasarahalli",
    inspector: "S. Nagaraj",
  },
  "blr-east": {
    label: "Bengaluru East",
    district: "blr-urban",
    color: "#16a34a",
    ring: ["j1", "j2", "j4", "o9", "j7", "j8", "j5"],
    labelAt: [13.08, 77.705],
    localBody: "BBMP East (Mahadevapura)",
    inspector: "R. Kumar",
  },
  "blr-south": {
    label: "Bengaluru South",
    district: "blr-urban",
    color: "#db2777",
    ring: ["j5", "j8", "j9", "o14", "o15", "o16", "j6"],
    labelAt: [12.87, 77.43],
    localBody: "BBMP South · RR Nagar",
    inspector: "M. Shwetha",
  },
  anekal: {
    label: "Anekal",
    district: "blr-urban",
    color: "#f59e0b",
    ring: ["j8", "j7", "o9", "o10", "o11", "o12", "o13", "j9"],
    labelAt: [12.68, 77.63],
    localBody: "Anekal TMC · Chandapura",
    inspector: "K. Prakash",
  },
  yelahanka: {
    label: "Yelahanka",
    district: "blr-urban",
    color: "#8b5cf6",
    ring: ["o17", "o1", "o2", "o3", "j2", "j1"],
    labelAt: [13.2, 77.52],
    localBody: "BBMP Yelahanka Zone",
    inspector: "A. Farooq",
  },
  devanahalli: {
    label: "Devanahalli",
    district: "blr-rural",
    color: "#0891b2",
    ring: ["o3", "o4", "o5", "o6", "j3", "j2"],
    labelAt: [13.33, 77.73],
    localBody: "Devanahalli TMC",
    inspector: "P. Ravi",
  },
  hoskote: {
    label: "Hoskote",
    district: "blr-rural",
    color: "#ea580c",
    ring: ["j2", "j3", "o6", "o7", "o8", "o9", "j4"],
    labelAt: [13.13, 77.9],
    localBody: "Hoskote CMC",
    inspector: "L. Manjunath",
  },
};

export const TALUK_ORDER: TalukId[] = ["blr-north", "blr-south", "blr-east", "anekal", "yelahanka", "devanahalli", "hoskote"];

export const TALUK_PATH = Object.fromEntries(TALUK_ORDER.map((id) => [id, ringPath(TALUKS[id].ring)])) as Record<TalukId, string>;

export const DISTRICTS: Record<DistrictId, { label: string; path: string; labelAt: LatLng }> = {
  "blr-urban": {
    label: "Bengaluru Urban District",
    path: ringPath(["o17", "o1", "o2", "o3", "j2", "j4", "o9", "o10", "o11", "o12", "o13", "j9", "o14", "o15", "o16"]),
    labelAt: [12.6, 77.47],
  },
  "blr-rural": {
    label: "Bengaluru Rural District",
    path: ringPath(["o3", "o4", "o5", "o6", "o7", "o8", "o9", "j4", "j2"]),
    labelAt: [13.4, 77.93],
  },
};

export function boundsOf(taluks: TalukId[]) {
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  taluks.forEach((id) =>
    TALUKS[id].ring.forEach((v) => {
      const [lat, lng] = V[v];
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }),
  );
  return { minLat, maxLat, minLng, maxLng };
}

export type Project = { id: string; name: string; place: string; taluk: TalukId; hobli?: string; at: LatLng };

export const PROJECTS: Project[] = [
  { id: "abc", name: "ABC Commercial Complex", place: "Marathahalli", taluk: "blr-east", at: [12.9616, 77.6973] },
  { id: "tech", name: "Tech Park Phase 2", place: "Mahadevapura", taluk: "blr-east", at: [12.985, 77.728] },
  { id: "white", name: "Whitefield IT Block", place: "Whitefield", taluk: "blr-east", at: [12.9698, 77.75] },
  { id: "indi", name: "Indiranagar Arcade", place: "Indiranagar", taluk: "blr-east", at: [12.9784, 77.6408] },
  { id: "bell", name: "Bellandur Lake View", place: "Bellandur", taluk: "blr-east", at: [12.9304, 77.6784] },
  { id: "hebb", name: "Hebbal Gateway", place: "Hebbal", taluk: "blr-north", at: [13.0358, 77.597] },
  { id: "yesh", name: "Yeshwanthpur Hub", place: "Yeshwanthpur", taluk: "blr-north", at: [13.028, 77.554] },
  { id: "mall", name: "Malleswaram Court", place: "Malleswaram", taluk: "blr-north", at: [13.0035, 77.571] },
  { id: "raja", name: "Rajajinagar Square", place: "Rajajinagar", taluk: "blr-north", at: [13.0, 77.545] },
  { id: "jaya", name: "Jayanagar Precinct", place: "Jayanagar", taluk: "blr-south", at: [12.925, 77.584] },
  { id: "jp", name: "JP Nagar Enclave", place: "JP Nagar", taluk: "blr-south", at: [12.906, 77.586] },
  { id: "vija", name: "Vijayanagar Heights", place: "Vijayanagar", taluk: "blr-south", at: [12.956, 77.53] },
  { id: "maple", name: "Maple Apartments", place: "Kengeri", taluk: "blr-south", at: [12.89, 77.5] },
  { id: "anekal-plaza", name: "Anekal Town Plaza", place: "Anekal", taluk: "anekal", hobli: "anekal-town", at: [12.7105, 77.696] },
  { id: "banner", name: "Bannerghatta Villas", place: "Bannerghatta", taluk: "anekal", hobli: "bannerghatta", at: [12.8, 77.577] },
  { id: "jigani", name: "Jigani Industrial Park", place: "Jigani", taluk: "anekal", hobli: "jigani", at: [12.784, 77.638] },
  { id: "chanda", name: "Chandapura Residency", place: "Chandapura", taluk: "anekal", hobli: "chandapura", at: [12.8, 77.706] },
  { id: "sky", name: "Skyline Residency", place: "Yelahanka", taluk: "yelahanka", hobli: "yelahanka-town", at: [13.125, 77.585] },
  { id: "hesara", name: "Hesaraghatta Greens", place: "Hesaraghatta", taluk: "yelahanka", hobli: "hesaraghatta", at: [13.145, 77.5] },
  { id: "airport", name: "Airport City Towers", place: "Devanahalli", taluk: "devanahalli", hobli: "devanahalli-town", at: [13.1986, 77.7066] },
  { id: "vij-market", name: "Vijayapura Market Complex", place: "Vijayapura", taluk: "devanahalli", hobli: "vijayapura", at: [13.29, 77.8] },
  { id: "hoskote-park", name: "Hoskote Logistics Park", place: "Hoskote", taluk: "hoskote", at: [13.07, 77.798] },
  { id: "hoskote-town", name: "Hoskote Township", place: "Hoskote", taluk: "hoskote", at: [13.1, 77.87] },
];

export type TreeKind = "state" | "district" | "department" | "taluk" | "hobli";
export type TreeNode = { id: string; label: string; kind: TreeKind; children?: TreeNode[] };

const leaf = (id: string, label: string, kind: TreeKind = "taluk"): TreeNode => ({ id, label, kind });

/** District → its PWD Department office → the territories (taluks) that office covers. */
const district = (id: string, label: string, territories: TreeNode[] = []): TreeNode => ({
  id,
  label,
  kind: "district",
  children: [
    {
      id: `${id}-dept`,
      label: "PWD Department",
      kind: "department",
      ...(territories.length ? { children: territories } : {}),
    },
  ],
});

export const TREE: TreeNode = {
  id: "ka",
  label: "Karnataka (31 Districts)",
  kind: "state",
  children: [
    district("blr-urban", "Bengaluru Urban", [
      leaf("blr-north", "Bengaluru North"),
      leaf("blr-south", "Bengaluru South"),
      leaf("blr-east", "Bengaluru East"),
      {
        id: "anekal",
        label: "Anekal",
        kind: "taluk",
        children: [
          leaf("anekal-town", "Anekal Town", "hobli"),
          leaf("bannerghatta", "Bannerghatta", "hobli"),
          leaf("jigani", "Jigani", "hobli"),
          leaf("chandapura", "Chandapura", "hobli"),
        ],
      },
      {
        id: "yelahanka",
        label: "Yelahanka",
        kind: "taluk",
        children: [leaf("yelahanka-town", "Yelahanka Town", "hobli"), leaf("hesaraghatta", "Hesaraghatta", "hobli")],
      },
    ]),
    district("blr-rural", "Bengaluru Rural", [
      {
        id: "devanahalli",
        label: "Devanahalli",
        kind: "taluk",
        children: [leaf("devanahalli-town", "Devanahalli Town", "hobli"), leaf("vijayapura", "Vijayapura", "hobli")],
      },
      leaf("hoskote", "Hoskote"),
      leaf("nelamangala", "Nelamangala"),
      leaf("doddaballapur", "Doddaballapur"),
    ]),
    district("ramanagara", "Ramanagara", [leaf("ramanagara-t", "Ramanagara"), leaf("channapatna", "Channapatna")]),
    district("chikkaballapur", "Chikkaballapur", [leaf("chikkaballapur-t", "Chikkaballapur"), leaf("gauribidanur", "Gauribidanur")]),
    district("kolar", "Kolar", [leaf("kolar-t", "Kolar"), leaf("malur", "Malur")]),
    district("mysuru", "Mysuru"),
    district("mandya", "Mandya"),
    district("belagavi", "Belagavi"),
    district("dharwad", "Dharwad"),
    district("kalaburagi", "Kalaburagi"),
    district("ballari", "Ballari"),
  ],
};

export const PARENT: Record<string, string | undefined> = {};
export const NODE: Record<string, TreeNode> = {};
(function index(node: TreeNode, parent?: string) {
  NODE[node.id] = node;
  PARENT[node.id] = parent;
  node.children?.forEach((child) => index(child, node.id));
})(TREE);

export function pathTo(id: string): TreeNode[] {
  const out: TreeNode[] = [];
  let cur: string | undefined = id;
  while (cur) {
    out.unshift(NODE[cur]);
    cur = PARENT[cur];
  }
  return out;
}

export type Focus = { taluks: TalukId[]; taluk?: TalukId; hobli?: string; district?: DistrictId; mapped: boolean };

/** What the map shows and zooms to for a tree selection. */
export function focusFor(id: string): Focus {
  if (NODE[id]?.kind === "department") return focusFor(PARENT[id] ?? "ka");
  if (id in TALUKS) return { taluks: [id as TalukId], taluk: id as TalukId, mapped: true };
  const parent = PARENT[id];
  if (parent && parent in TALUKS) return { taluks: [parent as TalukId], taluk: parent as TalukId, hobli: id, mapped: true };
  if (id === "blr-urban" || id === "blr-rural") {
    return { taluks: TALUK_ORDER.filter((t) => TALUKS[t].district === id), district: id, mapped: true };
  }
  return { taluks: TALUK_ORDER, mapped: id === "ka" };
}

export type PhaseId = "assessment" | "demand" | "payment" | "remittance" | "reconciliation" | "closed";

export const PHASES: { id: PhaseId; label: string; short: string; date: string; color: string }[] = [
  { id: "assessment", label: "Assessment", short: "Assess", date: "15 Jan 2025", color: "#8b5cf6" },
  { id: "demand", label: "Demand", short: "Demand", date: "15 Jan 2025", color: "#ea580c" },
  { id: "payment", label: "Payment", short: "Payment", date: "14 Feb 2025", color: "#db2777" },
  { id: "remittance", label: "Remittance", short: "Remit", date: "20 Feb 2025", color: "#0ea5e9" },
  { id: "reconciliation", label: "Reconciliation", short: "Recon", date: "25 Feb 2025", color: "#ca8a04" },
  { id: "closed", label: "Closed", short: "Closed", date: "28 Feb 2025", color: "#16a34a" },
];

export const PHASE_BY_ID = Object.fromEntries(PHASES.map((ph) => [ph.id, ph])) as Record<PhaseId, (typeof PHASES)[number]>;

export const PHASE_INDEX = Object.fromEntries(PHASES.map((ph, i) => [ph.id, i])) as Record<PhaseId, number>;

export type StatusId =
  | "assess-pending"
  | "assess-progress"
  | "assess-done"
  | "demand-generated"
  | "notice-issued"
  | "payment-due"
  | "cess-deducted"
  | "remit-pending"
  | "remit-overdue"
  | "remit-received"
  | "under-recon"
  | "reconciled"
  | "discrepancy"
  | "closed";

export type Status = { id: StatusId; label: string; meaning: string; color: string; phase: PhaseId; exception?: boolean };

export const STATUSES: Status[] = [
  { id: "assess-pending", label: "Assessment Pending", meaning: "Assessment has not yet been completed", color: "#94a3b8", phase: "assessment" },
  { id: "assess-progress", label: "Assessment In Progress", meaning: "Field assessment is underway", color: "#8b5cf6", phase: "assessment" },
  { id: "assess-done", label: "Assessment Completed", meaning: "Assessment completed", color: "#6366f1", phase: "assessment" },
  { id: "demand-generated", label: "Demand Generated", meaning: "CESS demand has been calculated", color: "#f59e0b", phase: "demand" },
  { id: "notice-issued", label: "Demand Notice Issued", meaning: "Notice has been issued", color: "#ea580c", phase: "demand" },
  { id: "payment-due", label: "Payment Due", meaning: "Payment or remittance is pending", color: "#db2777", phase: "payment" },
  { id: "cess-deducted", label: "CESS Deducted", meaning: "CESS has been deducted at source", color: "#0891b2", phase: "payment" },
  { id: "remit-pending", label: "Remittance Pending", meaning: "Deducted or collected amount not yet remitted", color: "#0ea5e9", phase: "remittance" },
  { id: "remit-overdue", label: "Remittance Overdue", meaning: "Remittance has crossed the prescribed period", color: "#dc2626", phase: "remittance", exception: true },
  { id: "remit-received", label: "Remittance Received", meaning: "Board has received the amount", color: "#0d9488", phase: "remittance" },
  { id: "under-recon", label: "Under Reconciliation", meaning: "Transaction is being matched", color: "#ca8a04", phase: "reconciliation" },
  { id: "reconciled", label: "Reconciled", meaning: "Demand, collection and remittance matched", color: "#65a30d", phase: "reconciliation" },
  { id: "discrepancy", label: "Discrepancy", meaning: "Amount, reference or project mismatch", color: "#be123c", phase: "reconciliation", exception: true },
  { id: "closed", label: "Closed", meaning: "CESS case fully processed", color: "#16a34a", phase: "closed" },
];

export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<StatusId, Status>;
export const STATUS_INDEX = Object.fromEntries(STATUSES.map((s, i) => [s.id, i])) as Record<StatusId, number>;

export const PROJECT_STATUS: Record<string, StatusId> = {
  jaya: "assess-pending",
  chanda: "assess-pending",
  "anekal-plaza": "assess-progress",
  banner: "assess-progress",
  yesh: "assess-done",
  bell: "demand-generated",
  jigani: "demand-generated",
  abc: "notice-issued",
  maple: "notice-issued",
  raja: "payment-due",
  indi: "payment-due",
  "vij-market": "payment-due",
  hesara: "cess-deducted",
  airport: "remit-pending",
  vija: "remit-overdue",
  white: "remit-received",
  "hoskote-town": "remit-received",
  "hoskote-park": "under-recon",
  mall: "reconciled",
  hebb: "discrepancy",
  tech: "closed",
  jp: "closed",
  sky: "closed",
};
