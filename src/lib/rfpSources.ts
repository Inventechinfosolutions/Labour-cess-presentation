/**
 * CESS collection agencies / integration sources as listed in the RFP
 * (Section 8 — Annexure A, Annexure B, planning authorities, ULBs, Gram Panchayats, Central agencies).
 * Used for Intake scene source inventory — not an exhaustive runtime directory.
 */

export const RFP_SOURCE_GROUPS: {
  id: string;
  title: string;
  note?: string;
  items: string[];
}[] = [
  {
    id: "annexure-a",
    title: "Annexure A — named State / Board partners",
    items: [
      "Khajane 2.0",
      "Karnataka Public Portal (e-Procurement)",
      "BBMP",
      "BDA",
      "BMRDA",
      "BWSS&DB",
      "KUIDFC",
      "KSIIDC",
      "KSIDC",
      "BMRCL",
      "CREDAI",
      "RERA",
      "BMTC",
      "KSRTC",
      "Karnataka Housing Board (KHB)",
      "Karnataka Slum Development Board (KSDB)",
      "Karnataka State Tourism Development Corporation Ltd.",
      "KIADB",
      "Public Works Department",
      "KSHIP",
      "SHDP",
      "KRDCL",
    ],
  },
  {
    id: "annexure-b",
    title: "Annexure B — departments, boards and local bodies",
    items: [
      "All City Corporations",
      "All Municipal Councils",
      "All Town Municipal Councils",
      "All Town Panchayats",
      "All Urban Development bodies",
      "All Planning Authorities",
      "All ESCOMs",
      "KPTCL",
      "KPCL",
      "KEB",
      "Rural Development and Panchayat Raj Department (RDPR)",
      "South Western Railways",
      "Devaraj Urs Truck Terminals & State Road Transport Corporations",
      "Karnataka Family and Health Welfare Department",
      "Karnataka Police Housing Board",
      "Rajiv Gandhi Rural Housing Corporation Limited (RGHCL)",
      "Water Resources Department (WRD)",
      "Minor Irrigation Department",
      "Department of Agriculture (KSDA)",
      "Cauvery Neeravari Nigam Limited",
      "Hemavathi Neeravari Nigam Limited",
      "Visveswaraya Jala Neeravari Nigam Limited",
      "Krishna Bhagya Neeravari Nigam Limited",
      "Karnataka Neeravari Nigam Limited",
      "All Smart City Corporations",
      "Karnataka Forest Department",
      "Horticulture Department",
      "Social Welfare Department",
      "Women and Child Welfare Department",
      "Department of Primary and Secondary Education",
      "Department of Higher Education",
      "Karnataka Antibiotics & Pharmaceuticals",
      "Karnataka Trade Promotion Organisation",
      "KIOCL",
    ],
  },
  {
    id: "planning",
    title: "Planning Authorities (illustrative list in RFP)",
    note: "As enumerated in the RFP (Anekal, BIAAPA, BMICAPA, and others).",
    items: [
      "Anekal Planning Authority",
      "Bangalore International Airport Area Planning Authority",
      "Bangalore–Mysore Infrastructure Area Planning Authority",
      "Greater Bangalore Bidadi Smart City Planning Authority",
      "Hampi World Heritage Area Planning Authority",
      "Satellite Town Ring Road Planning Authority",
      "Other Planning Authorities listed in the RFP",
    ],
  },
  {
    id: "ulb-local",
    title: "Urban Local Bodies & local units",
    note: "City Corporations, ULBs, Town Municipal Councils, Taluk Panchayats and Notified Area Committees as listed in the RFP.",
    items: [
      "City Corporations (Ballari, Belagavi, Davangere, Hubballi–Dharwad, Kalaburagi, Mangaluru, Mysuru, Shivamogga, Tumakuru, Vijayapura, and others)",
      "Urban Local Bodies (as listed)",
      "Town Municipal Councils (as listed)",
      "Taluk Panchayats (as listed)",
      "Notified Area Committees (as listed)",
    ],
  },
  {
    id: "gp",
    title: "Gram Panchayats",
    items: ["Over 7,000 Gram Panchayats in the State of Karnataka"],
  },
  {
    id: "central",
    title: "Central agencies (illustrative)",
    note: "As listed in the RFP (HAL, BHEL, NTPC, NHPC, IRCON, and others).",
    items: [
      "Airports Authority of India",
      "Bharat Electronics Limited (BEL)",
      "Bharat Heavy Electricals Limited (BHEL)",
      "Bharat Petroleum / Indian Oil / ONGC and other CPSUs listed",
      "Hindustan Aeronautics Limited (HAL)",
      "IRCON / RVNL / Konkan Railway / other railway CPSUs listed",
      "NTPC / NHPC / Power Grid and other power CPSUs listed",
      "Other Central agencies enumerated in the RFP",
    ],
  },
  {
    id: "board",
    title: "Board / platform integrations",
    items: [
      "KBOCWWB Karmika Seva Kendra (KSK) platform",
      "Labour CESS Portal (builders / contractors / collecting agencies)",
      "CESS API / Connector Self-Service Portal",
    ],
  },
];

/** Named applications / agencies for API–connector integration (RFP Annexure A + B). */
export const RFP_INTEGRATION_APP_COUNT =
  RFP_SOURCE_GROUPS.find((g) => g.id === "annexure-a")!.items.length +
  RFP_SOURCE_GROUPS.find((g) => g.id === "annexure-b")!.items.length;

export const RFP_INTEGRATION_LABEL = String(RFP_INTEGRATION_APP_COUNT);
export const RFP_INTEGRATION_HINT =
  "Applications and agencies listed for integration under RFP Annexures A and B (connectors / APIs)";
