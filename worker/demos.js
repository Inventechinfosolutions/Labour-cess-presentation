// Every demo is served under /<id>/ and unlocked separately with its own PIN.
// Bump `pinVersion` to issue a new PIN for a demo: the old PIN, and every client
// it unlocked, stop working after the next deploy.
// `designs` lists what the admin can hide from clients. `id` must match the id the app
// uses. With a `path`, the Worker also blocks that page (and anything under it) for clients.
export const DEMOS = [
  { id: "labour-cess", name: "Labour CESS Tracking & Monitoring System", pinVersion: 1 },
  {
    id: "global-connect",
    name: "Global Connect",
    pinVersion: 1,
    spa: true,
    designs: [
      { id: "global", name: "Global theme", style: "Navy, sky blue and gold" },
      { id: "heritage", name: "Heritage theme", style: "Ivory, forest green and gold" },
      { id: "horizon", name: "Horizon theme", style: "White, royal blue and saffron" },
    ],
  },
  {
    id: "ksic",
    name: "KSIC · Design Gallery",
    pinVersion: 1,
    designs: [
      { id: "design-01", path: "/design-01", name: "Design 1", style: "Timeless Elegance" },
      { id: "design-02", path: "/design-02", name: "Design 2", style: "A Legacy of Grace" },
      { id: "design-03", path: "/design-03", name: "Design 3", style: "A Timeless Heritage" },
      { id: "design-04", path: "/design-04", name: "Design 4", style: "Sage Garden" },
      { id: "design-05", path: "/design-05", name: "Design 5", style: "Lilac Mist" },
      { id: "design-06", path: "/design-06", name: "Design 6", style: "Monsoon Blue" },
      { id: "design-07", path: "/design-07", name: "Design 7", style: "Marigold Glow" },
      { id: "design-08", path: "/design-08", name: "Design 8", style: "Rose Petal" },
    ],
  },
  {
    id: "bda",
    name: "BDA · Main Web App",
    pinVersion: 1,
    spa: true,
    designs: [
      { id: "photo", path: "/design-1", name: "Design 1", style: "Photo" },
      { id: "illustrated", path: "/design-2", name: "Design 2", style: "Illustrated" },
      { id: "showcase", path: "/design-3", name: "Design 3", style: "Showcase" },
      { id: "modern", path: "/design-4", name: "Design 4", style: "Modern" },
      { id: "geometric", path: "/design-5", name: "Design 5", style: "Geometric" },
      { id: "orbit", path: "/design-6", name: "Design 6", style: "Orbit" },
      { id: "portal", path: "/design-7", name: "Design 7", style: "Citizen Portal" },
      { id: "civic", path: "/design-8", name: "Design 8", style: "Citizen Services" },
      { id: "garden", path: "/design-9", name: "Design 9", style: "Watercolour" },
    ],
  },
  { id: "fms", name: "RGUHS FMS · Finance Management System", pinVersion: 1 },
  { id: "solar", name: "Solar PMIS · Project Management", pinVersion: 1, spa: true },
  { id: "guest-house", name: "Guest House Booking", pinVersion: 1, spa: true },
  { id: "ocss", name: "CSMS · Claim Settlement Management System", pinVersion: 1, spa: true },
  { id: "pension", name: "PensionFlow AI · Pension Recovery Management", pinVersion: 1, spa: true },
];
