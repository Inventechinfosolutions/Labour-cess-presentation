import { createContext, useContext } from "react";
import type { Text } from "@/lib/i18n";

export type Design = "photo" | "illustrated" | "showcase" | "modern" | "geometric" | "orbit" | "portal" | "civic" | "garden";

export const DESIGNS: { id: Design; path: string; label: Text; style: Text; summary: Text; image: string }[] = [
  {
    id: "photo",
    path: "/design-1",
    label: { en: "Design 1", kn: "ವಿನ್ಯಾಸ 1" },
    style: { en: "Photo", kn: "ಛಾಯಾಚಿತ್ರ" },
    summary: {
      en: "Photographic hero of the BDA building, blue navigation bar, white service cards and bright blue accents.",
      kn: "ಬಿಡಿಎ ಕಟ್ಟಡದ ಛಾಯಾಚಿತ್ರ, ನೀಲಿ ನ್ಯಾವಿಗೇಷನ್ ಪಟ್ಟಿ, ಬಿಳಿ ಸೇವಾ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಪ್ರಕಾಶಮಾನ ನೀಲಿ ಬಣ್ಣ.",
    },
    image: "images/previews/design-1.jpg",
  },
  {
    id: "illustrated",
    path: "/design-2",
    label: { en: "Design 2", kn: "ವಿನ್ಯಾಸ 2" },
    style: { en: "Illustrated", kn: "ರೇಖಾಚಿತ್ರ" },
    summary: {
      en: "Framed photo slideshow hero, light white navigation, soft tinted service tiles and navy accents.",
      kn: "ಚೌಕಟ್ಟಿನ ಛಾಯಾಚಿತ್ರ ಸ್ಲೈಡ್‌ಶೋ, ಬಿಳಿ ನ್ಯಾವಿಗೇಷನ್, ತಿಳಿ ಬಣ್ಣದ ಸೇವಾ ಟೈಲ್‌ಗಳು ಮತ್ತು ಗಾಢ ನೀಲಿ ಬಣ್ಣ.",
    },
    image: "images/previews/design-2.jpg",
  },
  {
    id: "showcase",
    path: "/design-3",
    label: { en: "Design 3", kn: "ವಿನ್ಯಾಸ 3" },
    style: { en: "Showcase", kn: "ಪ್ರದರ್ಶನ" },
    summary: {
      en: "Sliding photo hero with a focus areas panel, a wave of service cards, an interactive layout map and featured services.",
      kn: "ಸ್ಲೈಡ್ ಆಗುವ ಛಾಯಾಚಿತ್ರ, ಗಮನದ ಕ್ಷೇತ್ರಗಳ ಫಲಕ, ಅಲೆಯಾಕಾರದ ಸೇವಾ ಕಾರ್ಡ್‌ಗಳು, ಸಂವಾದಾತ್ಮಕ ಬಡಾವಣೆ ನಕ್ಷೆ ಮತ್ತು ಪ್ರಮುಖ ಸೇವೆಗಳು.",
    },
    image: "images/previews/design-3.jpg",
  },
  {
    id: "modern",
    path: "/design-4",
    label: { en: "Design 4", kn: "ವಿನ್ಯಾಸ 4" },
    style: { en: "Modern", kn: "ಆಧುನಿಕ" },
    summary: {
      en: "Wave-cut photo hero, highlight cards, a 20-tile quick access grid that animates as you search, and a swipeable news carousel.",
      kn: "ಅಲೆಯ ಅಂಚಿನ ಛಾಯಾಚಿತ್ರ, ಮುಖ್ಯಾಂಶ ಕಾರ್ಡ್‌ಗಳು, ಹುಡುಕಾಟದೊಂದಿಗೆ ಚಲಿಸುವ 20 ಸೇವಾ ಟೈಲ್‌ಗಳು ಮತ್ತು ಸ್ವೈಪ್ ಮಾಡಬಹುದಾದ ಸುದ್ದಿ ಕ್ಯಾರೊಸೆಲ್.",
    },
    image: "images/previews/design-4.jpg",
  },
  {
    id: "geometric",
    path: "/design-5",
    label: { en: "Design 5", kn: "ವಿನ್ಯಾಸ 5" },
    style: { en: "Geometric", kn: "ಜ್ಯಾಮಿತೀಯ" },
    summary: {
      en: "Angled photo hero with stacked help cards, a diamond lattice of services around a central BDA hub, and a housing photo banner.",
      kn: "ಕೋನೀಯ ಛಾಯಾಚಿತ್ರ ಮತ್ತು ಸಹಾಯ ಕಾರ್ಡ್‌ಗಳು, ಕೇಂದ್ರ ಬಿಡಿಎ ಸುತ್ತ ವಜ್ರಾಕಾರದ ಸೇವೆಗಳು ಮತ್ತು ವಸತಿ ಛಾಯಾಚಿತ್ರ ಫಲಕ.",
    },
    image: "images/previews/design-5.jpg",
  },
  {
    id: "orbit",
    path: "/design-6",
    label: { en: "Design 6", kn: "ವಿನ್ಯಾಸ 6" },
    style: { en: "Orbit", kn: "ಕಕ್ಷೆ" },
    summary: {
      en: "Glass-panel hero, a rotating orbit of key services with a popular services list, card-row announcements and a parallax housing panorama.",
      kn: "ಗಾಜಿನ ಫಲಕದ ಮುಖಭಾಗ, ತಿರುಗುವ ಸೇವಾ ಕಕ್ಷೆ ಮತ್ತು ಜನಪ್ರಿಯ ಸೇವೆಗಳು, ಕಾರ್ಡ್ ಸಾಲಿನ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ವಸತಿ ಸಮುಚ್ಚಯದ ವಿಹಂಗಮ ನೋಟ.",
    },
    image: "images/previews/design-6.jpg",
  },
  {
    id: "portal",
    path: "/design-7",
    label: { en: "Design 7", kn: "ವಿನ್ಯಾಸ 7" },
    style: { en: "Citizen Portal", kn: "ನಾಗರಿಕ ಪೋರ್ಟಲ್" },
    summary: {
      en: "Built on the new information architecture: an 8-area mega menu, three citizen paths, Explore BDA, current initiatives and tabbed updates and assets.",
      kn: "ಹೊಸ ಮಾಹಿತಿ ವಿನ್ಯಾಸದ ಮೇಲೆ ನಿರ್ಮಿತ: 8 ವಿಭಾಗಗಳ ಮೆನು, ಮೂರು ನಾಗರಿಕ ಮಾರ್ಗಗಳು, ಬಿಡಿಎ ಅನ್ವೇಷಣೆ, ಪ್ರಸ್ತುತ ಉಪಕ್ರಮಗಳು ಮತ್ತು ಟ್ಯಾಬ್ ಆಧಾರಿತ ಅಪ್‌ಡೇಟ್‌ಗಳು.",
    },
    image: "images/previews/design-7.jpg",
  },
  {
    id: "civic",
    path: "/design-8",
    label: { en: "Design 8", kn: "ವಿನ್ಯಾಸ 8" },
    style: { en: "Citizen Services", kn: "ನಾಗರಿಕ ಸೇವೆಗಳು" },
    summary: {
      en: "Bright pastel portal: a soft photo hero with quick chips, six colour-coded Explore BDA cards, a quick citizen services band, initiatives, tabbed updates and assets, and important links.",
      kn: "ತಿಳಿ ಬಣ್ಣದ ಪೋರ್ಟಲ್: ತ್ವರಿತ ಲಿಂಕ್‌ಗಳೊಂದಿಗೆ ಮೃದು ಛಾಯಾಚಿತ್ರ, ಆರು ಬಣ್ಣದ ಬಿಡಿಎ ಅನ್ವೇಷಣಾ ಕಾರ್ಡ್‌ಗಳು, ತ್ವರಿತ ನಾಗರಿಕ ಸೇವೆಗಳು, ಉಪಕ್ರಮಗಳು, ಟ್ಯಾಬ್ ಆಧಾರಿತ ಅಪ್‌ಡೇಟ್‌ಗಳು ಮತ್ತು ಪ್ರಮುಖ ಲಿಂಕ್‌ಗಳು.",
    },
    image: "images/previews/design-8.jpg",
  },
  {
    id: "garden",
    path: "/design-9",
    label: { en: "Design 9", kn: "ವಿನ್ಯಾಸ 9" },
    style: { en: "Watercolour", kn: "ಜಲವರ್ಣ" },
    summary: {
      en: "Soft watercolour portal: a circular photo slideshow hero, round quick service buttons, slanted Explore BDA cards, initiatives and a landscape footer.",
      kn: "ಮೃದು ಜಲವರ್ಣ ಪೋರ್ಟಲ್: ವೃತ್ತಾಕಾರದ ಛಾಯಾಚಿತ್ರ ಸ್ಲೈಡ್‌ಶೋ, ದುಂಡನೆಯ ತ್ವರಿತ ಸೇವಾ ಬಟನ್‌ಗಳು, ಓರೆಯಾದ ಬಿಡಿಎ ಅನ್ವೇಷಣಾ ಕಾರ್ಡ್‌ಗಳು, ಉಪಕ್ರಮಗಳು ಮತ್ತು ಭೂದೃಶ್ಯದ ಅಡಿಭಾಗ.",
    },
    image: "images/previews/design-9.jpg",
  },
];

const DesignContext = createContext<Design>("photo");

export const DesignProvider = DesignContext.Provider;

export function useDesign() {
  const design = useContext(DesignContext);
  return {
    design,
    isPhoto: design === "photo",
    root: DESIGNS.find((d) => d.id === design)!.path,
    pick: <T,>(photo: T, other: T) => (design === "photo" ? photo : other),
  };
}
