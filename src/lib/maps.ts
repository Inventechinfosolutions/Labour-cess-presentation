import { PIN } from "@/lib/palette";

export type LatLng = [number, number];
export type MapKind = "gis" | "layers" | "leak" | "gps" | "karnataka" | "karnataka-mini";

export type Pin = {
  id: string;
  name: string;
  latlng: LatLng;
  color: string;
  status: string;
};

const ABC: LatLng = [12.9616, 77.6973];
const BLR: LatLng = [12.9716, 77.5946];

export const PROJECTS: Pin[] = [
  { id: "abc", name: "ABC Commercial Complex", latlng: ABC, color: PIN.active, status: "In progress" },
  { id: "sky", name: "Skyline Residency", latlng: [13.035, 77.571], color: PIN.ok, status: "Assessed" },
  { id: "tech", name: "Tech Park Phase 2", latlng: [12.935, 77.695], color: PIN.navy, status: "Active" },
  { id: "orion", name: "Orion Mall Expansion", latlng: [13.011, 77.555], color: PIN.pending, status: "Pending" },
  { id: "maple", name: "Maple Apartments", latlng: [12.927, 77.518], color: PIN.ok, status: "Active" },
];

export const LEAK: Pin[] = [
  { id: "abc", name: "ABC Commercial Complex", latlng: ABC, color: PIN.risk, status: "Exception" },
  { id: "a", name: "Project A", latlng: [13.04, 77.61], color: PIN.ok, status: "CESS paid" },
  { id: "b", name: "Project B", latlng: [12.97, 77.54], color: PIN.pending, status: "Payment pending" },
  { id: "c", name: "Project C", latlng: [13.08, 77.64], color: PIN.pending, status: "Unregistered" },
  { id: "d", name: "Project D", latlng: [12.96, 77.72], color: PIN.ok, status: "Registered" },
  { id: "e", name: "Project E", latlng: [12.89, 77.58], color: PIN.pending, status: "Remittance pending" },
];

export const DISTRICTS: Pin[] = [
  { id: "abc", name: "Bengaluru · ABC Complex", latlng: ABC, color: PIN.risk, status: "Attention" },
  { id: "mys", name: "Mysuru", latlng: [12.295, 76.655], color: PIN.ok, status: "Compliant" },
  { id: "tum", name: "Tumakuru", latlng: [13.34, 77.102], color: PIN.pending, status: "Pending" },
  { id: "bel", name: "Belagavi", latlng: [15.849, 74.498], color: PIN.navy, status: "Active" },
  { id: "kal", name: "Kalaburagi", latlng: [17.329, 76.834], color: PIN.ok, status: "Compliant" },
];

const VIEWS: Record<MapKind, { q: string; z: number; label: string }> = {
  gis: { q: `${BLR[0]},${BLR[1]}`, z: 12, label: "Bengaluru" },
  layers: { q: `${ABC[0]},${ABC[1]}`, z: 15, label: "ABC Commercial Complex" },
  leak: { q: `${BLR[0]},${BLR[1]}`, z: 12, label: "Bengaluru" },
  gps: { q: `${ABC[0]},${ABC[1]}`, z: 17, label: "ABC site GPS" },
  karnataka: { q: "Karnataka, India", z: 7, label: "Karnataka" },
  "karnataka-mini": { q: "Karnataka, India", z: 6, label: "Karnataka" },
};

export type EmbedOpts = {
  /** Satellite imagery (realistic site view). */
  satellite?: boolean;
  zoom?: number;
};

export function googleEmbedSrc(kind: MapKind, pin?: Pin, opts?: EmbedOpts) {
  const view = VIEWS[kind];
  const q = pin ? `${pin.latlng[0]},${pin.latlng[1]}` : view.q;
  const satellite = Boolean(opts?.satellite);
  const z =
    opts?.zoom ??
    (pin ? Math.max(view.z, satellite ? 18 : 14) : satellite ? Math.max(view.z, 15) : view.z);
  const type = satellite ? "&t=k" : "";
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${z}${type}&output=embed`;
}

export function mapLabel(kind: MapKind) {
  return VIEWS[kind].label;
}
