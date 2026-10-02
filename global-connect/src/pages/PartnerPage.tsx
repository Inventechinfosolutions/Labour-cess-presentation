import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "motion/react";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { BuildSelector } from "@/components/partner/BuildSelector";
import { EcosystemMap } from "@/components/partner/EcosystemMap";
import { FindMatch } from "@/components/partner/FindMatch";
import { GlobalKarnataka } from "@/components/partner/GlobalKarnataka";
import { PartnerCta } from "@/components/partner/PartnerCta";
import { PartnerHero } from "@/components/partner/PartnerHero";
import { HeritagePartnerHero } from "@/components/heritage/hero/heroes";
import { HorizonPartnerHero } from "@/components/horizon/hero/heroes";
import { useTheme } from "@/theme/context";
import { PartnerOpportunities } from "@/components/partner/PartnerOpportunities";
import { PartnershipJourney } from "@/components/partner/PartnershipJourney";
import { PartnershipTypes } from "@/components/partner/PartnershipTypes";
import { TrackPartnership } from "@/components/partner/TrackPartnership";
import { EMPTY_SELECTION, type Selection } from "@/components/partner/selection";

export function PartnerPage() {
  const reduce = useReducedMotion() ?? false;
  const { theme } = useTheme();
  const { hash } = useLocation();
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);

  useEffect(() => {
    if (!hash) return;
    const id = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 60);
    return () => window.clearTimeout(id);
  }, [hash]);

  return (
    <>
      {!reduce ? <ScrollProgress /> : null}
      <SiteHeader />
      <main>
        {theme === "heritage" ? (
          <HeritagePartnerHero reduce={reduce} />
        ) : theme === "horizon" ? (
          <HorizonPartnerHero reduce={reduce} />
        ) : (
          <PartnerHero reduce={reduce} />
        )}
        <PartnershipJourney reduce={reduce} />
        <PartnershipTypes reduce={reduce} />
        <BuildSelector reduce={reduce} value={selection} onChange={setSelection} />
        <section className="relative overflow-x-clip bg-white px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-16 xl:grid-cols-2 xl:gap-12">
            <FindMatch reduce={reduce} selection={selection} />
            <EcosystemMap reduce={reduce} />
          </div>
        </section>
        <section className="relative overflow-x-clip bg-[#fafaff] px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-16 xl:grid-cols-2 xl:gap-12">
            <GlobalKarnataka reduce={reduce} />
            <PartnerOpportunities reduce={reduce} />
          </div>
        </section>
        <TrackPartnership reduce={reduce} />
        <PartnerCta reduce={reduce} />
      </main>
      <SiteFooter />
    </>
  );
}
