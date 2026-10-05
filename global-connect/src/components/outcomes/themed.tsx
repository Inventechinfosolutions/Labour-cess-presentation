import { SectionHeading } from "@/components/home/SectionHeading";
import { HeritageTitle } from "@/components/heritage/parts";
import { HorizonTitle } from "@/components/horizon/parts";
import { LOOP_PALETTES } from "@/lib/outcomes";
import { EcosystemLoop } from "./EcosystemLoop";
import { OutcomeFunnel } from "./OutcomeFunnel";

type Props = { reduce: boolean };

const LOOP_SUB = "Each stage feeds the next. Every success brings in new members.";
const FUNNEL_SUB = "We measure outcomes, not website visits.";

export function GlobalLoop({ reduce }: Props) {
  return (
    <EcosystemLoop
      reduce={reduce}
      palette={LOOP_PALETTES.global}
      className="bg-white"
      heading={<SectionHeading align="left" eyebrow="A continuous cycle" title="An Ecosystem That Keeps Growing" sub={LOOP_SUB} reduce={reduce} />}
    />
  );
}

export function GlobalFunnel({ reduce }: Props) {
  return (
    <OutcomeFunnel
      reduce={reduce}
      palette={LOOP_PALETTES.global}
      className="bg-white"
      heading={<SectionHeading align="left" eyebrow="Outcomes that matter" title="Measuring What Matters" sub={FUNNEL_SUB} reduce={reduce} />}
    />
  );
}

export function HeritageLoop({ reduce }: Props) {
  return (
    <EcosystemLoop
      reduce={reduce}
      palette={LOOP_PALETTES.heritage}
      className="bg-[#fffdf8]"
      heading={
        <HeritageTitle align="left" sub={LOOP_SUB} reduce={reduce}>
          An Ecosystem That Keeps Growing
        </HeritageTitle>
      }
    />
  );
}

export function HeritageFunnel({ reduce }: Props) {
  return (
    <OutcomeFunnel
      reduce={reduce}
      palette={LOOP_PALETTES.heritage}
      className="bg-[#fffdf8]"
      heading={
        <HeritageTitle align="left" sub={FUNNEL_SUB} reduce={reduce}>
          Measuring What Matters
        </HeritageTitle>
      }
    />
  );
}

export function HorizonLoop({ reduce }: Props) {
  return (
    <EcosystemLoop
      reduce={reduce}
      palette={LOOP_PALETTES.horizon}
      className="bg-gradient-to-b from-white to-[#f3f7ff]"
      heading={
        <HorizonTitle sub={LOOP_SUB} reduce={reduce}>
          An Ecosystem That Keeps Growing
        </HorizonTitle>
      }
    />
  );
}

export function HorizonFunnel({ reduce }: Props) {
  return (
    <OutcomeFunnel
      reduce={reduce}
      palette={LOOP_PALETTES.horizon}
      className="bg-white"
      heading={
        <HorizonTitle sub={FUNNEL_SUB} reduce={reduce}>
          Measuring What Matters
        </HorizonTitle>
      }
    />
  );
}
