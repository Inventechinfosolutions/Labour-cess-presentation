/** Operational drill-down data for KPI card detail views */

export type FeScheme = {
  name: string
  investors: number
  amount: number
}

export type FeCompany = {
  id: string
  name: string
  shortName: string
  accent: string
  victims: number
  totalAmount: number
  claims: number
  recovered: number
  settled: number
  liability: number
  schemes: FeScheme[]
  sparkVictims: number[]
  sparkRecovered: number[]
}

export type VictimInvestment = {
  companyId: string
  companyName: string
  scheme: string
  invested: number
  returnsTaken: number
}

export type VictimRecord = {
  id: string
  customerId: string
  name: string
  pan: string
  aadhaar: string
  district: string
  investments: VictimInvestment[]
}

export type ClaimRecord = {
  id: string
  claimId: string
  customerId: string
  name: string
  pan: string
  aadhaar: string
  district: string
  status: string
  claimAmount: number
  investments: VictimInvestment[]
}

export type RecoveredAsset = {
  id: string
  companyId: string
  companyName: string
  assetType: "Property" | "Bank account" | "Vehicle" | "Jewellery" | "Other"
  description: string
  location: string
  recoveredAmount: number
  status: "Sold" | "Attached" | "Auction pending" | "Transferred"
}

export const feCompanies: FeCompany[] = [
  {
    id: "fe-ima",
    name: "IMA Jewels",
    shortName: "IMA",
    accent: "#3b82f6",
    victims: 98_420,
    totalAmount: 2_486_40_00_000,
    claims: 96_420,
    recovered: 612_40_00_000,
    settled: 486_20_00_000,
    liability: 2_186_40_00_000,
    sparkVictims: [82, 86, 90, 93, 95, 97, 98],
    sparkRecovered: [420, 460, 510, 540, 570, 590, 612],
    schemes: [
      { name: "Gold Savings Plan", investors: 42_180, amount: 1_124_00_00_000 },
      { name: "Diamond Deposit Scheme", investors: 28_640, amount: 786_40_00_000 },
      { name: "IMA Privilege Bonds", investors: 18_420, amount: 412_00_00_000 },
      { name: "Monthly Return Plan", investors: 9_180, amount: 164_00_00_000 },
    ],
  },
  {
    id: "fe-lancer",
    name: "Lancer Finance",
    shortName: "Lancer",
    accent: "#8b5cf6",
    victims: 36_210,
    totalAmount: 842_60_00_000,
    claims: 34_860,
    recovered: 248_20_00_000,
    settled: 198_40_00_000,
    liability: 712_80_00_000,
    sparkVictims: [28, 30, 32, 33, 34, 35, 36],
    sparkRecovered: [160, 180, 198, 210, 225, 238, 248],
    schemes: [
      { name: "Fixed Deposit Plus", investors: 18_420, amount: 486_00_00_000 },
      { name: "Lancer Growth Bonds", investors: 12_180, amount: 268_60_00_000 },
      { name: "Monthly Income Scheme", investors: 5_610, amount: 88_00_00_000 },
    ],
  },
  {
    id: "fe-ibc",
    name: "Innovative Business Centre",
    shortName: "IBC",
    accent: "#f97316",
    victims: 16_840,
    totalAmount: 486_20_00_000,
    claims: 14_210,
    recovered: 148_00_00_000,
    settled: 126_40_00_000,
    liability: 420_00_00_000,
    sparkVictims: [12, 13, 14, 15, 15.5, 16, 16.8],
    sparkRecovered: [90, 102, 115, 124, 132, 140, 148],
    schemes: [
      { name: "Business Partner Deposit", investors: 9_840, amount: 312_00_00_000 },
      { name: "IBC Franchise Bonds", investors: 4_620, amount: 124_20_00_000 },
      { name: "Quick Return Plan", investors: 2_380, amount: 50_00_00_000 },
    ],
  },
  {
    id: "fe-surya",
    name: "Surya Chits",
    shortName: "Surya",
    accent: "#22c55e",
    victims: 8_420,
    totalAmount: 186_40_00_000,
    claims: 5_842,
    recovered: 64_80_00_000,
    settled: 48_20_00_000,
    liability: 148_60_00_000,
    sparkVictims: [6.2, 6.8, 7.2, 7.6, 7.9, 8.1, 8.4],
    sparkRecovered: [38, 44, 50, 54, 58, 62, 65],
    schemes: [
      { name: "Chit Fund Group A", investors: 4_820, amount: 98_40_00_000 },
      { name: "Chit Fund Group B", investors: 2_640, amount: 62_00_00_000 },
      { name: "Lucky Draw Scheme", investors: 960, amount: 26_00_00_000 },
    ],
  },
  {
    id: "fe-riddhi",
    name: "Riddhi Finance",
    shortName: "Riddhi",
    accent: "#0ea5e9",
    victims: 5_200,
    totalAmount: 58_00_00_000,
    claims: 1_100,
    recovered: 22_00_00_000,
    settled: 20_00_00_000,
    liability: 50_00_00_000,
    sparkVictims: [3.8, 4.1, 4.4, 4.7, 4.9, 5.0, 5.2],
    sparkRecovered: [12, 14, 16, 18, 19, 21, 22],
    schemes: [
      { name: "Secure Deposit Plan", investors: 3_200, amount: 36_00_00_000 },
      { name: "Monthly Income Bond", investors: 2_000, amount: 22_00_00_000 },
    ],
  },
  {
    id: "fe-capricorn",
    name: "Capricorn Investments",
    shortName: "Capricorn",
    accent: "#6366f1",
    victims: 4_100,
    totalAmount: 48_00_00_000,
    claims: 920,
    recovered: 18_00_00_000,
    settled: 16_00_00_000,
    liability: 42_00_00_000,
    sparkVictims: [3.0, 3.2, 3.5, 3.7, 3.9, 4.0, 4.1],
    sparkRecovered: [10, 12, 13, 15, 16, 17, 18],
    schemes: [
      { name: "Growth Deposit Scheme", investors: 2_600, amount: 30_00_00_000 },
      { name: "Capricorn Privilege", investors: 1_500, amount: 18_00_00_000 },
    ],
  },
  {
    id: "fe-metro",
    name: "Metro Chit Fund",
    shortName: "Metro",
    accent: "#14b8a6",
    victims: 3_800,
    totalAmount: 42_00_00_000,
    claims: 780,
    recovered: 16_00_00_000,
    settled: 14_50_00_000,
    liability: 36_00_00_000,
    sparkVictims: [2.8, 3.0, 3.2, 3.4, 3.6, 3.7, 3.8],
    sparkRecovered: [9, 10, 12, 13, 14, 15, 16],
    schemes: [
      { name: "Metro Chit Group 1", investors: 2_400, amount: 26_00_00_000 },
      { name: "Metro Chit Group 2", investors: 1_400, amount: 16_00_00_000 },
    ],
  },
  {
    id: "fe-golden",
    name: "Golden Trust",
    shortName: "Golden",
    accent: "#eab308",
    victims: 3_200,
    totalAmount: 36_00_00_000,
    claims: 720,
    recovered: 14_00_00_000,
    settled: 13_00_00_000,
    liability: 31_00_00_000,
    sparkVictims: [2.4, 2.6, 2.8, 2.9, 3.0, 3.1, 3.2],
    sparkRecovered: [8, 9, 10, 11, 12, 13, 14],
    schemes: [
      { name: "Golden Savings Plan", investors: 3_200, amount: 36_00_00_000 },
    ],
  },
  {
    id: "fe-apex",
    name: "Apex Savings",
    shortName: "Apex",
    accent: "#f43f5e",
    victims: 2_800,
    totalAmount: 32_00_00_000,
    claims: 640,
    recovered: 12_00_00_000,
    settled: 11_00_00_000,
    liability: 28_00_00_000,
    sparkVictims: [2.0, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8],
    sparkRecovered: [6, 7, 8, 9, 10, 11, 12],
    schemes: [
      { name: "Apex Fixed Deposit", investors: 1_800, amount: 20_00_00_000 },
      { name: "Apex Recurring Plan", investors: 1_000, amount: 12_00_00_000 },
    ],
  },
  {
    id: "fe-sunrise",
    name: "Sunrise Bonds",
    shortName: "Sunrise",
    accent: "#f97316",
    victims: 2_400,
    totalAmount: 28_00_00_000,
    claims: 520,
    recovered: 10_00_00_000,
    settled: 9_00_00_000,
    liability: 24_00_00_000,
    sparkVictims: [1.7, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4],
    sparkRecovered: [5, 6, 7, 8, 9, 9.5, 10],
    schemes: [
      { name: "Sunrise Bond Series A", investors: 2_400, amount: 28_00_00_000 },
    ],
  },
  {
    id: "fe-vision",
    name: "Vision Credit",
    shortName: "Vision",
    accent: "#a855f7",
    victims: 1_800,
    totalAmount: 22_00_00_000,
    claims: 480,
    recovered: 8_00_00_000,
    settled: 7_50_00_000,
    liability: 18_00_00_000,
    sparkVictims: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8],
    sparkRecovered: [4, 5, 5.5, 6, 7, 7.5, 8],
    schemes: [
      { name: "Vision Credit Deposit", investors: 1_800, amount: 22_00_00_000 },
    ],
  },
  {
    id: "fe-unity",
    name: "Unity Deposits",
    shortName: "Unity",
    accent: "#64748b",
    victims: 1_372,
    totalAmount: 18_80_00_000,
    claims: 350,
    recovered: 6_20_00_000,
    settled: 6_25_00_000,
    liability: 15_95_00_000,
    sparkVictims: [0.9, 1.0, 1.1, 1.2, 1.25, 1.3, 1.37],
    sparkRecovered: [3, 3.5, 4, 4.5, 5, 5.8, 6.2],
    schemes: [
      { name: "Unity Community Deposit", investors: 1_372, amount: 18_80_00_000 },
    ],
  },
]

export const victimRecords: VictimRecord[] = [
  {
    id: "v-1",
    customerId: "CUST-IMA-88421",
    name: "Rajesh Kumar Sharma",
    pan: "ABCPK1234F",
    aadhaar: "XXXX-XXXX-4821",
    district: "Bengaluru Urban",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Gold Savings Plan",
        invested: 12_50_000,
        returnsTaken: 2_40_000,
      },
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Diamond Deposit Scheme",
        invested: 5_00_000,
        returnsTaken: 75_000,
      },
    ],
  },
  {
    id: "v-2",
    customerId: "CUST-LC-109284",
    name: "Priya Natarajan",
    pan: "BGHPN5678K",
    aadhaar: "XXXX-XXXX-1092",
    district: "Mysuru",
    investments: [
      {
        companyId: "fe-lancer",
        companyName: "Lancer Finance",
        scheme: "Fixed Deposit Plus",
        invested: 8_00_000,
        returnsTaken: 1_60_000,
      },
    ],
  },
  {
    id: "v-3",
    customerId: "CUST-IBC-55201",
    name: "Mohammed Irfan",
    pan: "CKLMI9012R",
    aadhaar: "XXXX-XXXX-5520",
    district: "Belagavi",
    investments: [
      {
        companyId: "fe-ibc",
        companyName: "Innovative Business Centre",
        scheme: "Business Partner Deposit",
        invested: 15_00_000,
        returnsTaken: 3_00_000,
      },
      {
        companyId: "fe-ibc",
        companyName: "Innovative Business Centre",
        scheme: "Quick Return Plan",
        invested: 2_50_000,
        returnsTaken: 50_000,
      },
    ],
  },
  {
    id: "v-4",
    customerId: "CUST-IMA-77610",
    name: "Lakshmi Devi",
    pan: "DEFLD3344M",
    aadhaar: "XXXX-XXXX-7761",
    district: "Tumakuru",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Monthly Return Plan",
        invested: 3_75_000,
        returnsTaken: 1_12_500,
      },
    ],
  },
  {
    id: "v-5",
    customerId: "CUST-SY-44102",
    name: "Suresh Gowda",
    pan: "EFGSG7788P",
    aadhaar: "XXXX-XXXX-4410",
    district: "Hassan",
    investments: [
      {
        companyId: "fe-surya",
        companyName: "Surya Chits",
        scheme: "Chit Fund Group A",
        invested: 4_20_000,
        returnsTaken: 84_000,
      },
    ],
  },
  {
    id: "v-6",
    customerId: "CUST-IMA-99102",
    name: "Anitha Reddy",
    pan: "FGHAR5566Q",
    aadhaar: "XXXX-XXXX-9910",
    district: "Bengaluru Urban",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "IMA Privilege Bonds",
        invested: 25_00_000,
        returnsTaken: 0,
      },
      {
        companyId: "fe-lancer",
        companyName: "Lancer Finance",
        scheme: "Lancer Growth Bonds",
        invested: 6_00_000,
        returnsTaken: 1_20_000,
      },
    ],
  },
  {
    id: "v-7",
    customerId: "CUST-LC-22018",
    name: "Venkatesh Murthy",
    pan: "GHIVM2233T",
    aadhaar: "XXXX-XXXX-2201",
    district: "Dharwad",
    investments: [
      {
        companyId: "fe-lancer",
        companyName: "Lancer Finance",
        scheme: "Monthly Income Scheme",
        invested: 5_50_000,
        returnsTaken: 1_65_000,
      },
    ],
  },
  {
    id: "v-8",
    customerId: "CUST-IBC-88340",
    name: "Fatima Begum",
    pan: "HIJFB8899U",
    aadhaar: "XXXX-XXXX-8834",
    district: "Kalaburagi",
    investments: [
      {
        companyId: "fe-ibc",
        companyName: "Innovative Business Centre",
        scheme: "IBC Franchise Bonds",
        invested: 7_80_000,
        returnsTaken: 1_56_000,
      },
    ],
  },
  {
    id: "v-9",
    customerId: "CUST-IMA-88455",
    name: "Kavitha Hegde",
    pan: "ABCKH8821L",
    aadhaar: "XXXX-XXXX-8845",
    district: "Udupi",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Gold Savings Plan",
        invested: 6_80_000,
        returnsTaken: 1_20_000,
      },
    ],
  },
  {
    id: "v-10",
    customerId: "CUST-IMA-88502",
    name: "Naveen Patil",
    pan: "ABCNP4410M",
    aadhaar: "XXXX-XXXX-8502",
    district: "Davanagere",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Gold Savings Plan",
        invested: 9_25_000,
        returnsTaken: 0,
      },
    ],
  },
  {
    id: "v-11",
    customerId: "CUST-IMA-88610",
    name: "Meenakshi Rao",
    pan: "ABCMR2290P",
    aadhaar: "XXXX-XXXX-8610",
    district: "Bengaluru Rural",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Gold Savings Plan",
        invested: 4_50_000,
        returnsTaken: 90_000,
      },
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "IMA Privilege Bonds",
        invested: 8_00_000,
        returnsTaken: 0,
      },
    ],
  },
  {
    id: "v-12",
    customerId: "CUST-IMA-88721",
    name: "Syed Abdul Rahman",
    pan: "ABCSR6677Q",
    aadhaar: "XXXX-XXXX-8721",
    district: "Shivamogga",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Gold Savings Plan",
        invested: 15_00_000,
        returnsTaken: 3_00_000,
      },
    ],
  },
  {
    id: "v-13",
    customerId: "CUST-IMA-88830",
    name: "Deepa Krishnamurthy",
    pan: "ABCDK3344R",
    aadhaar: "XXXX-XXXX-8830",
    district: "Chikkamagaluru",
    investments: [
      {
        companyId: "fe-ima",
        companyName: "IMA Jewels",
        scheme: "Diamond Deposit Scheme",
        invested: 11_20_000,
        returnsTaken: 2_10_000,
      },
    ],
  },
]

export function schemeIdFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function findCompanyScheme(companyId: string, schemeId: string) {
  const company = feCompanies.find((c) => c.id === companyId)
  if (!company) return null
  const scheme = company.schemes.find(
    (s) => schemeIdFromName(s.name) === schemeId,
  )
  if (!scheme) return null
  return { company, scheme }
}

export type SchemeDepositor = {
  id: string
  customerId: string
  name: string
  pan: string
  aadhaar: string
  district: string
  invested: number
  returnsTaken: number
}

export function getSchemeDepositors(
  companyId: string,
  schemeName: string,
): SchemeDepositor[] {
  return victimRecords.flatMap((v) => {
    const inv = v.investments.find(
      (i) => i.companyId === companyId && i.scheme === schemeName,
    )
    if (!inv) return []
    return [
      {
        id: v.id,
        customerId: v.customerId,
        name: v.name,
        pan: v.pan,
        aadhaar: v.aadhaar,
        district: v.district,
        invested: inv.invested,
        returnsTaken: inv.returnsTaken,
      },
    ]
  })
}

export const claimRecords: ClaimRecord[] = [
  {
    id: "c-1",
    claimId: "CLM-2024-IMA-88421",
    customerId: "CUST-IMA-88421",
    name: "Rajesh Kumar Sharma",
    pan: "ABCPK1234F",
    aadhaar: "XXXX-XXXX-4821",
    district: "Bengaluru Urban",
    status: "Settlement calculated",
    claimAmount: 15_10_000,
    investments: victimRecords[0].investments,
  },
  {
    id: "c-2",
    claimId: "CLM-2024-LC-109284",
    customerId: "CUST-LC-109284",
    name: "Priya Natarajan",
    pan: "BGHPN5678K",
    aadhaar: "XXXX-XXXX-1092",
    district: "Mysuru",
    status: "Approved",
    claimAmount: 6_40_000,
    investments: victimRecords[1].investments,
  },
  {
    id: "c-3",
    claimId: "CLM-2024-IBC-55201",
    customerId: "CUST-IBC-55201",
    name: "Mohammed Irfan",
    pan: "CKLMI9012R",
    aadhaar: "XXXX-XXXX-5520",
    district: "Belagavi",
    status: "Under Evaluation",
    claimAmount: 14_00_000,
    investments: victimRecords[2].investments,
  },
  {
    id: "c-4",
    claimId: "CLM-2024-IMA-77610",
    customerId: "CUST-IMA-77610",
    name: "Lakshmi Devi",
    pan: "DEFLD3344M",
    aadhaar: "XXXX-XXXX-7761",
    district: "Tumakuru",
    status: "Documents pending",
    claimAmount: 2_62_500,
    investments: victimRecords[3].investments,
  },
  {
    id: "c-5",
    claimId: "CLM-2025-SY-44102",
    customerId: "CUST-SY-44102",
    name: "Suresh Gowda",
    pan: "EFGSG7788P",
    aadhaar: "XXXX-XXXX-4410",
    district: "Hassan",
    status: "Payment queued",
    claimAmount: 3_36_000,
    investments: victimRecords[4].investments,
  },
  {
    id: "c-6",
    claimId: "CLM-2025-IMA-99102",
    customerId: "CUST-IMA-99102",
    name: "Anitha Reddy",
    pan: "FGHAR5566Q",
    aadhaar: "XXXX-XXXX-9910",
    district: "Bengaluru Urban",
    status: "Settlement calculated",
    claimAmount: 29_80_000,
    investments: victimRecords[5].investments,
  },
  {
    id: "c-7",
    claimId: "CLM-2025-LC-22018",
    customerId: "CUST-LC-22018",
    name: "Venkatesh Murthy",
    pan: "GHIVM2233T",
    aadhaar: "XXXX-XXXX-2201",
    district: "Dharwad",
    status: "Approved",
    claimAmount: 3_85_000,
    investments: victimRecords[6].investments,
  },
  {
    id: "c-8",
    claimId: "CLM-2025-IBC-88340",
    customerId: "CUST-IBC-88340",
    name: "Fatima Begum",
    pan: "HIJFB8899U",
    aadhaar: "XXXX-XXXX-8834",
    district: "Kalaburagi",
    status: "Under Evaluation",
    claimAmount: 6_24_000,
    investments: victimRecords[7].investments,
  },
]

export const recoveredAssets: RecoveredAsset[] = [
  {
    id: "a-1",
    companyId: "fe-ima",
    companyName: "IMA Jewels",
    assetType: "Property",
    description: "Commercial building — Koramangala",
    location: "Bengaluru Urban",
    recoveredAmount: 186_40_00_000,
    status: "Sold",
  },
  {
    id: "a-2",
    companyId: "fe-ima",
    companyName: "IMA Jewels",
    assetType: "Bank account",
    description: "Frozen current A/c — Axis Bank",
    location: "Bengaluru Urban",
    recoveredAmount: 98_20_00_000,
    status: "Transferred",
  },
  {
    id: "a-3",
    companyId: "fe-ima",
    companyName: "IMA Jewels",
    assetType: "Jewellery",
    description: "Gold & diamond stock inventory",
    location: "Bengaluru Urban",
    recoveredAmount: 142_80_00_000,
    status: "Sold",
  },
  {
    id: "a-4",
    companyId: "fe-ima",
    companyName: "IMA Jewels",
    assetType: "Property",
    description: "Residential villa — Whitefield",
    location: "Bengaluru Urban",
    recoveredAmount: 64_00_00_000,
    status: "Auction pending",
  },
  {
    id: "a-5",
    companyId: "fe-ima",
    companyName: "IMA Jewels",
    assetType: "Vehicle",
    description: "Fleet of 12 luxury cars",
    location: "Bengaluru Urban",
    recoveredAmount: 18_40_00_000,
    status: "Sold",
  },
  {
    id: "a-6",
    companyId: "fe-lancer",
    companyName: "Lancer Finance",
    assetType: "Property",
    description: "Office complex — Jayanagar",
    location: "Bengaluru Urban",
    recoveredAmount: 84_60_00_000,
    status: "Sold",
  },
  {
    id: "a-7",
    companyId: "fe-lancer",
    companyName: "Lancer Finance",
    assetType: "Bank account",
    description: "Frozen FD & savings — SBI",
    location: "Mysuru",
    recoveredAmount: 72_40_00_000,
    status: "Transferred",
  },
  {
    id: "a-8",
    companyId: "fe-lancer",
    companyName: "Lancer Finance",
    assetType: "Property",
    description: "Agricultural land — Mandya",
    location: "Mandya",
    recoveredAmount: 48_20_00_000,
    status: "Attached",
  },
  {
    id: "a-9",
    companyId: "fe-lancer",
    companyName: "Lancer Finance",
    assetType: "Other",
    description: "Shares & mutual fund units",
    location: "Bengaluru Urban",
    recoveredAmount: 43_00_00_000,
    status: "Sold",
  },
  {
    id: "a-10",
    companyId: "fe-ibc",
    companyName: "Innovative Business Centre",
    assetType: "Property",
    description: "Warehouse — Peenya industrial",
    location: "Bengaluru Urban",
    recoveredAmount: 68_40_00_000,
    status: "Sold",
  },
  {
    id: "a-11",
    companyId: "fe-ibc",
    companyName: "Innovative Business Centre",
    assetType: "Bank account",
    description: "Frozen current A/c — HDFC",
    location: "Bengaluru Urban",
    recoveredAmount: 42_60_00_000,
    status: "Transferred",
  },
  {
    id: "a-12",
    companyId: "fe-ibc",
    companyName: "Innovative Business Centre",
    assetType: "Vehicle",
    description: "Commercial vehicles (8)",
    location: "Belagavi",
    recoveredAmount: 12_80_00_000,
    status: "Sold",
  },
  {
    id: "a-13",
    companyId: "fe-ibc",
    companyName: "Innovative Business Centre",
    assetType: "Property",
    description: "Showroom — Hubballi",
    location: "Dharwad",
    recoveredAmount: 24_20_00_000,
    status: "Auction pending",
  },
  {
    id: "a-14",
    companyId: "fe-surya",
    companyName: "Surya Chits",
    assetType: "Property",
    description: "Chit office building — Hassan",
    location: "Hassan",
    recoveredAmount: 28_40_00_000,
    status: "Sold",
  },
  {
    id: "a-15",
    companyId: "fe-surya",
    companyName: "Surya Chits",
    assetType: "Bank account",
    description: "Frozen savings — Canara Bank",
    location: "Hassan",
    recoveredAmount: 22_60_00_000,
    status: "Transferred",
  },
  {
    id: "a-16",
    companyId: "fe-surya",
    companyName: "Surya Chits",
    assetType: "Other",
    description: "Cash recovered from premises",
    location: "Hassan",
    recoveredAmount: 13_80_00_000,
    status: "Transferred",
  },
  {
    id: "a-17",
    companyId: "fe-riddhi",
    companyName: "Riddhi Finance",
    assetType: "Property",
    description: "Commercial plot — Peenya",
    location: "Bengaluru Urban",
    recoveredAmount: 64_20_00_000,
    status: "Sold",
  },
  {
    id: "a-18",
    companyId: "fe-capricorn",
    companyName: "Capricorn Investments",
    assetType: "Bank account",
    description: "Frozen accounts — HDFC & Canara",
    location: "Mysuru",
    recoveredAmount: 42_00_00_000,
    status: "Transferred",
  },
]

export const programmeTotals = {
  entities: feCompanies.length,
  depositors: feCompanies.reduce((sum, company) => sum + company.victims, 0),
  totalDeposits: feCompanies.reduce((sum, company) => sum + company.totalAmount, 0),
  claims: feCompanies.reduce((sum, company) => sum + company.claims, 0),
  grossLiability: feCompanies.reduce((sum, company) => sum + company.liability, 0),
  recovered: feCompanies.reduce((sum, company) => sum + company.recovered, 0),
  settled: feCompanies.reduce((sum, company) => sum + company.settled, 0),
  assetsListed: recoveredAssets.length,
}

export const kpiLabels = {
  fes: "Fraudulent Entities Registered",
  depositors: "Depositors Registered",
  investments: "Total Deposit Amount",
  claims: "Claims Submitted",
  liability: "Total Settlement Liability",
  recovered: "Recovered Amount from Attached Assets",
  settled: "Settlement Amount Disbursed",
} as const

export function matchesPersonSearch(
  query: string,
  person: { name: string; pan: string; aadhaar: string; customerId: string },
): boolean {
  const q = query.trim().toLowerCase().replace(/\s+/g, "")
  if (!q) return true
  const hay = [
    person.name,
    person.pan,
    person.aadhaar,
    person.customerId,
  ]
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, "")
  return hay.includes(q.replace(/-/g, ""))
}
