import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useReducedMotion } from "motion/react";
import { DiscoverCta } from "@/components/discover/DiscoverCta";
import { DiscoverHero } from "@/components/discover/DiscoverHero";
import { HeritageDiscoverHero } from "@/components/heritage/hero/heroes";
import { HorizonDiscoverHero } from "@/components/horizon/hero/heroes";
import { useTheme } from "@/theme/context";
import { FeaturedAreas } from "@/components/discover/FeaturedAreas";
import { FindOpportunity } from "@/components/discover/FindOpportunity";
import { ImpactJourney } from "@/components/discover/ImpactJourney";
import { OpportunityMatches } from "@/components/discover/OpportunityMatches";
import { RegionExplorer } from "@/components/discover/RegionExplorer";
import { SearchOpportunities } from "@/components/discover/SearchOpportunities";
import { EMPTY_FILTERS, type Filters } from "@/components/discover/data";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";

export function DiscoverPage() {
  const reduce = useReducedMotion() ?? false;
  const { theme } = useTheme();
  const { hash } = useLocation();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [saved, setSaved] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!hash) return;
    const id = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 60);
    return () => window.clearTimeout(id);
  }, [hash]);

  const showResults = useCallback(
    (patch: Partial<Filters>) => {
      setFilters({ ...EMPTY_FILTERS, ...patch });
      window.requestAnimationFrame(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
      });
    },
    [reduce],
  );

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <>
      {!reduce ? <ScrollProgress /> : null}
      <SiteHeader />
      <main>
        {theme === "heritage" ? (
          <HeritageDiscoverHero reduce={reduce} />
        ) : theme === "horizon" ? (
          <HorizonDiscoverHero reduce={reduce} />
        ) : (
          <DiscoverHero reduce={reduce} />
        )}
        <FindOpportunity reduce={reduce} active={filters.category} onPick={(category) => showResults({ category })} />
        <SearchOpportunities reduce={reduce} filters={filters} setFilters={setFilters} saved={saved} toggleSaved={toggleSaved} />
        <section className="relative overflow-x-clip bg-[#fbf7fb] px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-16 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:gap-12">
            <RegionExplorer reduce={reduce} onView={(location) => showResults({ location })} />
            <OpportunityMatches reduce={reduce} savedCount={saved.size} />
          </div>
        </section>
        <ImpactJourney reduce={reduce} />
        <FeaturedAreas reduce={reduce} onPick={(q) => showResults({ q })} />
        <DiscoverCta reduce={reduce} />
      </main>
      <SiteFooter />
    </>
  );
}
