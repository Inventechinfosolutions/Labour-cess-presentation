import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Atom,
  Buildings,
  Check,
  Cpu,
  DotsThreeCircle,
  Factory,
  GitFork,
  Info,
  Rocket,
  TrendUp,
  type Icon,
} from "@phosphor-icons/react";
import bengaluru from "@/assets/invest/loc-bengaluru.jpg";
import hubballi from "@/assets/invest/loc-hubballi.jpg";
import mangaluru from "@/assets/invest/loc-mangaluru.jpg";
import mysuru from "@/assets/invest/loc-mysuru.jpg";
import other from "@/assets/invest/loc-other.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import { EASE } from "./shared";

const INTERESTS: { label: string; icon: Icon }[] = [
  { label: "New Investment", icon: Rocket },
  { label: "Expansion", icon: TrendUp },
  { label: "Joint Venture", icon: GitFork },
  { label: "Research & Innovation", icon: Atom },
  { label: "Manufacturing", icon: Factory },
  { label: "Technology", icon: Cpu },
  { label: "Infrastructure", icon: Buildings },
  { label: "Other", icon: DotsThreeCircle },
];

const LOCATIONS = [
  { label: "Bengaluru", image: bengaluru },
  { label: "Mysuru", image: mysuru },
  { label: "Mangaluru", image: mangaluru },
  { label: "Hubballi–Dharwad", image: hubballi },
  { label: "Other Regions", image: other },
];

const RANGES = ["Up to ₹50 Crore", "₹50–200 Crore", "₹200–500 Crore", "₹500–1,000 Crore", "Above ₹1,000 Crore"];

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function LookingFor({ reduce }: { reduce: boolean }) {
  const [interests, setInterests] = useState<string[]>(["New Investment"]);
  const [locations, setLocations] = useState<string[]>(["Bengaluru"]);
  const [range, setRange] = useState<string>("₹200–500 Crore");

  return (
    <section id="interest" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Your interest"
        title="Tell Us What You Are Looking For"
        sub="Help us understand your investment interest."
        reduce={reduce}
      />

      <div className="mx-auto mt-12 max-w-[1220px] space-y-10">
        <Group n={1} title="Investment Interest" hint="Choose one or more" reduce={reduce}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {INTERESTS.map(({ label, icon: Icon }, i) => {
              const on = interests.includes(label);
              return (
                <Selectable key={label} on={on} onClick={() => setInterests((l) => toggle(l, label))} reduce={reduce} i={i}>
                  <span className="flex flex-col items-center gap-2 px-2 py-4 text-center">
                    <Icon size={28} weight="duotone" className={on ? "text-[#1f6fe5]" : "text-[#4a5a78]"} />
                    <span className="text-[13px] leading-tight font-medium text-[#0b1f4a]">{label}</span>
                  </span>
                </Selectable>
              );
            })}
          </div>
        </Group>

        <Group n={2} title="Preferred Location" hint="Choose one or more" reduce={reduce}>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
            {LOCATIONS.map(({ label, image }, i) => {
              const on = locations.includes(label);
              return (
                <Selectable
                  key={label}
                  on={on}
                  onClick={() => setLocations((l) => toggle(l, label))}
                  reduce={reduce}
                  i={i}
                  className="w-[62%] shrink-0 snap-start sm:w-auto"
                >
                  <span className="block overflow-hidden rounded-t-[14px]">
                    <img src={image} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  </span>
                  <span className="block px-3 py-2.5 text-left text-[14px] font-semibold text-[#0b1f4a]">{label}</span>
                </Selectable>
              );
            })}
          </div>
        </Group>

        <Group n={3} title="Investment Range" hint="Choose one" reduce={reduce}>
          <div className="flex flex-wrap gap-3">
            {RANGES.map((r, i) => (
              <Selectable key={r} on={range === r} onClick={() => setRange(r)} reduce={reduce} i={i} pill>
                <span className="block px-5 py-2.5 text-[14px] font-semibold text-[#0b1f4a]">{r}</span>
              </Selectable>
            ))}
          </div>
        </Group>

        <motion.div
          className="flex flex-col gap-3 rounded-2xl bg-[#f4f8fd] px-5 py-4 ring-1 ring-[#1f6fe5]/10 sm:flex-row sm:items-center"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="flex-1 text-[14px] text-[#0b1f4a]">
            <span className="font-semibold">Your selection: </span>
            {[interests.join(", ") || "No interest chosen", locations.join(", ") || "No location chosen", range].join(" · ")}
          </p>
          <p className="flex items-center gap-1.5 text-[12.5px] text-[#4a5a78]">
            <Info size={15} /> Preview only. Nothing is submitted.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Group({ n, title, hint, reduce, children }: { n: number; title: string; hint: string; reduce: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="grid size-7 place-items-center rounded-full bg-[#0b1f4a] font-display text-[12px] font-bold text-white">{n}</span>
        <h3 className="font-display text-[18px] font-semibold text-[#0b1f4a]">{title}</h3>
        <span className="text-[13px] text-[#8a97ad]">{hint}</span>
      </div>
      {children}
    </motion.div>
  );
}

function Selectable({
  on,
  onClick,
  reduce,
  i,
  pill = false,
  className,
  children,
}: {
  on: boolean;
  onClick: () => void;
  reduce: boolean;
  i: number;
  pill?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "relative border-2 bg-white transition-colors",
        pill ? "rounded-full" : "rounded-2xl",
        on
          ? "border-[#1f6fe5] bg-[#f2f7ff] shadow-[0_10px_24px_rgba(31,111,229,0.16)]"
          : "border-[#e6ebf3] hover:border-[#1f6fe5]/40",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      animate={{ scale: on ? 1.02 : 1 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        duration: 0.45,
        delay: reduce ? 0 : i * 0.05,
        ease: EASE,
        scale: { type: "spring", stiffness: 420, damping: 24 },
      }}
    >
      {children}
      <motion.span
        className={cn(
          "absolute grid size-5 place-items-center rounded-full bg-[#e0a91f] text-white ring-2 ring-white",
          pill ? "-top-1.5 -right-1.5" : "top-2 right-2",
        )}
        initial={false}
        animate={on ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
      >
        <Check size={11} weight="bold" />
      </motion.span>
    </motion.button>
  );
}
