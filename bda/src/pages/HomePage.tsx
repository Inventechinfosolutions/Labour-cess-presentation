import { AboutBanner } from "@/components/home/AboutBanner";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { News } from "@/components/home/News";
import { QuickAccess } from "@/components/home/QuickAccess";
import { OnlineServices, QuickLinks } from "@/components/home/ServiceRows";
import { Updates } from "@/components/home/Updates";

export function HomePage() {
  return (
    <>
      <Hero />
      <Highlights />
      <QuickAccess />
      <Updates />
      <OnlineServices />
      <QuickLinks />
      <News />
      <AboutBanner />
    </>
  );
}
