// Hand-picked stable Unsplash CDN images themed around finance, university and operations.
const u = (id: string, w = 1920, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const local = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const fmsImages = {
  heroBg: u('photo-1554224155-6726b3ff858f', 2400),
  heroFinance: u('photo-1611974789855-9c2a0a7236a3', 1600),
  campus: u('photo-1523050854058-8df90110c9f1', 1800),
  students: u('photo-1450101499163-c8848c66ca85', 1800),
  dashboard: u('photo-1551288049-bebda4e38f71', 1800),
  reports: u('photo-1460925895917-afdab827c52f', 1800),
  banking: u('photo-1556761175-5973dc0f32e7', 1800),
  audit: u('photo-1554224154-26032ffc0d07', 1800),
  vendor: u('photo-1556742044-3c52d6e88c62', 1800),
  meeting: u('photo-1573164713988-8665fc963095', 1800),
  laptop: u('photo-1607082348824-0a96f2a4b9da', 1800),
  team: u('photo-1521737604893-d14cc237f11d', 1800),
  growthChart: u('photo-1590283603385-17ffb3a7f29f', 1800),
  modernOffice: u('photo-1497366216548-37526070297c', 1800),
  // Module-specific backgrounds (govt-finance feel)
  modReceipts: u('photo-1604693135398-43e8b631bcc1', 1600), // rupee notes / cash
  modBills:    u('photo-1554224155-1696413565d3', 1600),    // documents / desk
  modBank:     u('photo-1551836022-deb4988cc6c0', 1600),    // bank columns
  modReports:  u('photo-1551288049-bebda4e38f71', 1600),    // dashboard
  modPortals:  u('photo-1523050854058-8df90110c9f1', 1600), // campus
  modSecurity: u('photo-1614064641938-3bbee52942c7', 1600), // vault / lock
  // Console screenshots
  consoleA: u('photo-1551288049-bebda4e38f71', 1400),
  consoleB: u('photo-1460925895917-afdab827c52f', 1400),
  consoleC: u('photo-1554224155-6726b3ff858f', 1400),
  consoleD: u('photo-1559526324-4b87b5e36e44', 1400),
  consoleE: u('photo-1611974789855-9c2a0a7236a3', 1400),
  consoleF: u('photo-1554224154-26032ffc0d07', 1400),
  consoleG: u('photo-1556761175-5973dc0f32e7', 1400),
  consoleH: u('photo-1543286386-713bdd548da4', 1400),
  // Image sequence — 6 frames showing the lifecycle stages
  seq: [
    u('photo-1450101499163-c8848c66ca85', 1800),
    u('photo-1573164713988-8665fc963095', 1800),
    u('photo-1556761175-5973dc0f32e7', 1800),
    u('photo-1551288049-bebda4e38f71', 1800),
    u('photo-1554224154-26032ffc0d07', 1800),
    u('photo-1590283603385-17ffb3a7f29f', 1800),
  ],
};

// Finance-themed video sources. Bundled local file first (always works), then
// remote fallbacks so we never lose the hero footage even if the local asset
// is missing in a deployment.
export const fmsVideos = {
  heroSources: [
    local('videos/hero-finance.mp4'),
    'https://videos.pexels.com/video-files/8770422/8770422-uhd_2560_1440_25fps.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  ],
  heroLocal: local('videos/hero-finance.mp4'),
  productDemo: local('videos/hero-finance.mp4'),
  productDemoFallback:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  posterImage: fmsImages.dashboard,
};

/** Sound effects bundled with the app. Use sparingly + with user-gesture only. */
export const fmsAudio = {
  /** Card-machine confirmation tone, ideal for payment success actions. */
  coins: local('audio/freesound_community-card-payment-machine-1-103738.mp3'),
  /** Smooth cave-like confirmation tone for reconciliation auto-match. */
  reconciliationMatch: local('audio/soundreality-match-cave-164967.mp3'),
};
