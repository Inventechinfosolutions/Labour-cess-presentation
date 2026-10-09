import { createFileRoute } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { db } from "@/lib/hooks";
import { AboutSection } from "./components/-AboutSection";
import { AnnouncementsSection } from "./components/-AnnouncementsSection";
import { HowItWorksSection } from "./components/-HowItWorksSectionV2";
import { LandingFooter } from "./components/-LandingFooter";
import { LandingHero } from "./components/-LandingHero";
import { LandingNavbar } from "./components/-LandingNavbar";
import { OpportunitiesSection } from "./components/-OpportunitiesSection";
import { ShowcaseSection } from "./components/-ShowcaseSection";
import { TestimonialsSection } from "./components/-TestimonialsSection";

export const Route = createFileRoute("/(landing)/")({
  head: () => ({
    meta: [
      { title: "PMIS — Renewable Project Management System" },
      {
        name: "description",
        content:
          "Government portal for transparent management of renewable energy project approvals, SLA tracking, and milestone governance.",
      },
      { property: "og:title", content: "PMIS — Renewable Project Management System" },
      {
        property: "og:description",
        content: "Apply, track, and manage renewable energy projects in one transparent portal.",
      },
    ],
  }),
  component: Landing,
});

gsap.registerPlugin(ScrollTrigger);

function Landing() {
  const opps = db.listOpportunities().slice(0, 4);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background text-left">
      <LandingNavbar />
      <LandingHero />
      <AboutSection />
      <OpportunitiesSection opportunities={opps} />
      <HowItWorksSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <AnnouncementsSection />
      <LandingFooter />
    </div>
  );
}
