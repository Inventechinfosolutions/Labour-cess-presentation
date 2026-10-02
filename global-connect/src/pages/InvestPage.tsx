import { useEffect } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "motion/react";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { ConnectPeople } from "@/components/invest/ConnectPeople";
import { ExpressInterest } from "@/components/invest/ExpressInterest";
import { FinalCta } from "@/components/invest/FinalCta";
import { HowItWorks } from "@/components/invest/HowItWorks";
import { InvestHero } from "@/components/invest/InvestHero";
import { HeritageInvestHero } from "@/components/heritage/hero/heroes";
import { useTheme } from "@/theme/context";
import { LookingFor } from "@/components/invest/LookingFor";
import { Opportunities } from "@/components/invest/Opportunities";
import { PortalSection } from "@/components/invest/PortalSection";
import { Relationship } from "@/components/invest/Relationship";
import { TrackJourney } from "@/components/invest/TrackJourney";

export function InvestPage() {
  const reduce = useReducedMotion() ?? false;
  const { theme } = useTheme();
  const { hash } = useLocation();

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
        {theme === "heritage" ? <HeritageInvestHero reduce={reduce} /> : <InvestHero reduce={reduce} />}
        <HowItWorks reduce={reduce} />
        <PortalSection reduce={reduce} />
        <LookingFor reduce={reduce} />
        <Opportunities reduce={reduce} />
        <ExpressInterest reduce={reduce} />
        <ConnectPeople reduce={reduce} />
        <TrackJourney reduce={reduce} />
        <Relationship reduce={reduce} />
        <FinalCta reduce={reduce} />
      </main>
      <SiteFooter />
    </>
  );
}
