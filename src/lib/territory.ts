/** Shared ABC territory hierarchy — RFP Module 2 (MIS & GIS based). */
export const TERRITORY_PATH = [
  { id: "state", label: "State", value: "Karnataka" },
  { id: "territory", label: "Territory / Division", value: "East Zone" },
  { id: "district", label: "District", value: "Bengaluru Urban" },
  { id: "ulb", label: "ULB / Local area", value: "BBMP" },
  { id: "project", label: "Project", value: "ABC Commercial Complex" },
] as const;

export const TERRITORY_PATH_SHORT = "Karnataka → East Zone → Bengaluru Urban → BBMP";

export const TERRITORY_CHAIN = [
  { id: "gps", label: "Project GPS" },
  { id: "gis", label: "GIS placement" },
  { id: "map", label: "Territory mapping" },
  { id: "users", label: "Designation · user" },
  { id: "ops", label: "Jurisdiction · monitoring" },
] as const;

/**
 * RFP Module 3 mapping for the ABC territory path.
 * Roles named as in RFP (district in-charge, labour inspector) — not invented ownership titles.
 */
export const TERRITORY_RESPONSIBILITY = [
  {
    id: "district-charge",
    department: "Labour Department",
    territory: "Bengaluru Urban",
    designation: "District in-charge",
    user: "Mapped staff profile",
    scope: "Prepare assessment lists for the district; the State may also assign lists.",
  },
  {
    id: "inspector",
    department: "Labour Department",
    territory: "BBMP · assigned projects",
    designation: "Labour Inspector",
    user: "Mapped staff profile",
    scope: "Update estimation particulars, GPS evidence and on-spot demand notices — limited to assigned projects.",
  },
] as const;

export const TERRITORY_MODULE = {
  title: "Territory (MIS & GIS)",
  body: "Hierarchical territory mapping connected to organisation structure — department, territory, designation and user.",
  items: [
    "Territory (MIS & GIS)",
    "Hierarchical mapping",
    "Organisation structure",
    "Department · territory · designation · user",
    "Territory-wise dashboards",
  ],
} as const;
