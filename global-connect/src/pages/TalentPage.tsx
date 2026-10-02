import { useEffect } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "motion/react";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { DemandMatch } from "@/components/talent/DemandMatch";
import { Ecosystem } from "@/components/talent/Ecosystem";
import { LookingFor } from "@/components/talent/LookingFor";
import { OpportunityMap } from "@/components/talent/OpportunityMap";
import { SkillsJourney } from "@/components/talent/SkillsJourney";
import { TalentCta } from "@/components/talent/TalentCta";
import { TalentHero } from "@/components/talent/TalentHero";
import { HeritageTalentHero } from "@/components/heritage/hero/heroes";
import { useTheme } from "@/theme/context";
import { TalentProfile } from "@/components/talent/TalentProfile";
import { TwoWays } from "@/components/talent/TwoWays";

export function TalentPage() {
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
        {theme === "heritage" ? <HeritageTalentHero reduce={reduce} /> : <TalentHero reduce={reduce} />}
        <SkillsJourney reduce={reduce} />
        <TalentProfile reduce={reduce} />
        <LookingFor reduce={reduce} />
        <DemandMatch reduce={reduce} />
        <OpportunityMap reduce={reduce} />
        <Ecosystem reduce={reduce} />
        <TwoWays reduce={reduce} />
        <TalentCta reduce={reduce} />
      </main>
      <SiteFooter />
    </>
  );
}
