export type Selection = {
  represent: string | null;
  interests: string[];
  want: string | null;
};

export const EMPTY_SELECTION: Selection = { represent: null, interests: [], want: null };

/** Which partner groups suit each interest; used to rank match results. */
export const INTEREST_PARTNERS: Record<string, string[]> = {
  Technology: ["Industry Clusters", "Startups & Innovation"],
  Research: ["Universities & Research"],
  Manufacturing: ["Industry Clusters", "Karnataka Government"],
  Education: ["Universities & Research"],
  Innovation: ["Startups & Innovation", "Universities & Research"],
  "Market Access": ["Karnataka Government", "Industry Clusters"],
};
