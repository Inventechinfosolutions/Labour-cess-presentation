import { PortalHero } from "@/components/portal/PortalHero";
import { PortalSections } from "@/components/portal/PortalSections";
import { PortalUpdates } from "@/components/portal/PortalUpdates";
import { SitemapCallout } from "@/components/portal/SitemapCallout";

export function PortalPage() {
  return (
    <>
      <PortalHero />
      <SitemapCallout />
      <PortalSections />
      <PortalUpdates />
    </>
  );
}
