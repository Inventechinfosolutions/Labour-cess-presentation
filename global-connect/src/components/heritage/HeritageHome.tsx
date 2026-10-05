import { HelpBand } from "@/components/nri/HelpBand";
import { HeritageFunnel, HeritageLoop } from "@/components/outcomes/themed";
import { AtAGlance } from "./AtAGlance";
import { FeaturedOpps } from "./FeaturedOpps";
import { GlobalReach } from "./GlobalReach";
import { GoalPicker } from "./GoalPicker";
import { HeritageCta } from "./HeritageCta";
import { HeritageHero } from "./HeritageHero";
import { PathwayTiles } from "./PathwayTiles";
import { ToTheWorld } from "./ToTheWorld";
import { WaysToConnect } from "./WaysToConnect";

export function HeritageHome({ reduce }: { reduce: boolean }) {
  return (
    <>
      <HeritageHero reduce={reduce} />
      <PathwayTiles reduce={reduce} />
      <AtAGlance reduce={reduce} />
      <HeritageLoop reduce={reduce} />
      <GlobalReach reduce={reduce} />
      <WaysToConnect reduce={reduce} />
      <GoalPicker reduce={reduce} />
      <ToTheWorld reduce={reduce} />
      <HeritageFunnel reduce={reduce} />
      <HelpBand reduce={reduce} />
      <FeaturedOpps reduce={reduce} />
      <HeritageCta reduce={reduce} />
    </>
  );
}
