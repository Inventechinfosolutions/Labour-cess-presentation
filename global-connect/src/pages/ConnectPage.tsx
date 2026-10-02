import { useEffect } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "motion/react";
import { Associations } from "@/components/connect/Associations";
import { CommunityJourney } from "@/components/connect/CommunityJourney";
import { CommunityMap } from "@/components/connect/CommunityMap";
import { ConnectCta } from "@/components/connect/ConnectCta";
import { ConnectHero } from "@/components/connect/ConnectHero";
import { HeritageConnectHero } from "@/components/heritage/hero/heroes";
import { HorizonConnectHero } from "@/components/horizon/hero/heroes";
import { useTheme } from "@/theme/context";
import { ConnectOpportunities } from "@/components/connect/ConnectOpportunities";
import { Events } from "@/components/connect/Events";
import { ExperienceImpact } from "@/components/connect/ExperienceImpact";
import { JoinNetwork } from "@/components/connect/JoinNetwork";
import { LocalImpact } from "@/components/connect/LocalImpact";
import { RegisterCta } from "@/components/connect/RegisterCta";
import { WhatCanYouDo } from "@/components/connect/WhatCanYouDo";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";

export function ConnectPage() {
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
        {theme === "heritage" ? (
          <HeritageConnectHero reduce={reduce} />
        ) : theme === "horizon" ? (
          <HorizonConnectHero reduce={reduce} />
        ) : (
          <ConnectHero reduce={reduce} />
        )}
        <CommunityJourney reduce={reduce} />
        <JoinNetwork reduce={reduce} />
        <RegisterCta reduce={reduce} />
        <CommunityMap reduce={reduce} />
        <WhatCanYouDo reduce={reduce} />
        <ExperienceImpact reduce={reduce} />
        <ConnectOpportunities reduce={reduce} />
        <Associations reduce={reduce} />
        <Events reduce={reduce} />
        <LocalImpact reduce={reduce} />
        <ConnectCta reduce={reduce} />
      </main>
      <SiteFooter />
    </>
  );
}
