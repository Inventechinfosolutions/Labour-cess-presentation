import { HelpBand } from "@/components/nri/HelpBand";
import { HorizonFunnel, HorizonLoop } from "@/components/outcomes/themed";
import { ConnectedGlobally } from "./ConnectedGlobally";
import { FeaturedRow } from "./FeaturedRow";
import { FivePathways } from "./FivePathways";
import { HorizonCta } from "./HorizonCta";
import { HorizonHero } from "./HorizonHero";
import { InNumbers } from "./InNumbers";
import { WhatToDo } from "./WhatToDo";

export function HorizonHome({ reduce }: { reduce: boolean }) {
  return (
    <>
      <HorizonHero reduce={reduce} />
      <FivePathways reduce={reduce} />
      <HorizonLoop reduce={reduce} />
      <InNumbers reduce={reduce} />
      <ConnectedGlobally reduce={reduce} />
      <WhatToDo reduce={reduce} />
      <HelpBand reduce={reduce} />
      <HorizonFunnel reduce={reduce} />
      <FeaturedRow reduce={reduce} />
      <HorizonCta reduce={reduce} />
    </>
  );
}
