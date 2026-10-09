import { GardenHero } from "@/components/garden/GardenHero";
import { GardenSections } from "@/components/garden/GardenSections";

const WASH =
  "bg-[#fbfcff] bg-[radial-gradient(55%_38%_at_0%_0%,#ffe8d9_0%,transparent_70%),radial-gradient(50%_36%_at_100%_6%,#dbeafe_0%,transparent_70%),radial-gradient(48%_30%_at_0%_42%,#dcfce7_0%,transparent_70%),radial-gradient(46%_30%_at_100%_52%,#fce7f3_0%,transparent_70%),radial-gradient(60%_26%_at_40%_96%,#e0f2fe_0%,transparent_70%)]";

export function GardenPage() {
  return (
    <div className={`relative isolate overflow-hidden ${WASH}`}>
      <GardenHero />
      <GardenSections />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-page" aria-hidden />
    </div>
  );
}
