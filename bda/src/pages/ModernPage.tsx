import { AboutBanner } from "@/components/home/AboutBanner";
import { Highlights } from "@/components/home/Highlights";
import { OnlineServices, QuickLinks } from "@/components/home/ServiceRows";
import { Updates } from "@/components/home/Updates";
import { ModernHero } from "@/components/modern/ModernHero";
import { NewsCarousel, ServiceGrid } from "@/components/modern/ModernSections";
import { PHOTOS } from "@/lib/photos";

export function ModernPage() {
  return (
    <>
      <ModernHero />
      <Highlights />
      <ServiceGrid />
      <Updates images={[PHOTOS.layoutSigns, PHOTOS.layoutBoard]} />
      <OnlineServices />
      <QuickLinks />
      <NewsCarousel />
      <AboutBanner image={PHOTOS.towers} />
    </>
  );
}
