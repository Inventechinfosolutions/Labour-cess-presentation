import { CivicHero } from "@/components/civic/CivicHero";
import { CivicSections } from "@/components/civic/CivicSections";
import { SitemapCallout } from "@/components/portal/SitemapCallout";

export function CivicPage() {
  return (
    <>
      <CivicHero />
      <SitemapCallout />
      <CivicSections />
    </>
  );
}
