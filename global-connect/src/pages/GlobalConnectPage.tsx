import { useEffect } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "motion/react";
import { HeritageHome } from "@/components/heritage/HeritageHome";
import { HorizonHome } from "@/components/horizon/HorizonHome";
import { CentralMessage } from "@/components/home/CentralMessage";
import { Explore } from "@/components/home/Explore";
import { Hero } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { HelpBand } from "@/components/nri/HelpBand";
import { GlobalFunnel, GlobalLoop } from "@/components/outcomes/themed";
import { Pathways } from "@/components/home/Pathways";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { useTheme } from "@/theme/context";

export function GlobalConnectPage() {
  const reduce = useReducedMotion() ?? false;
  const { hash } = useLocation();
  const { theme } = useTheme();

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
          <HeritageHome reduce={reduce} />
        ) : theme === "horizon" ? (
          <HorizonHome reduce={reduce} />
        ) : (
          <>
            <Hero reduce={reduce} />
            <Pathways reduce={reduce} />
            <Journey reduce={reduce} />
            <GlobalLoop reduce={reduce} />
            <CentralMessage reduce={reduce} />
            <GlobalFunnel reduce={reduce} />
            <HelpBand reduce={reduce} />
            <Explore reduce={reduce} />
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
