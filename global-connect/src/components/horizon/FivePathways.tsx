import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { ChartBar, GraduationCap, Handshake, Lightbulb, UsersThree, type Icon } from "@phosphor-icons/react";
import { pathwayHref, type PathwayId } from "@/lib/pathways";
import { cn } from "@/lib/utils";
import { EASE, rise } from "@/components/heritage/motion";
import { HZ_COLOR } from "./palette";
import { ArrowDot, AsideNote, HorizonTitle, PrevNext } from "./parts";

const CARDS: { id: PathwayId; title: [string, string]; text: string; icon: Icon }[] = [
  { id: "invest", title: ["Invest", "in Karnataka"], text: "Explore sectors, locations and opportunities for investment.", icon: ChartBar },
  { id: "connect", title: ["Connect with", "Kannadigas"], text: "Join a global community and contribute to Karnataka's growth.", icon: UsersThree },
  { id: "talent", title: ["Discover", "Global Talent"], text: "Connect skills, research and opportunities across borders.", icon: GraduationCap },
  { id: "partner", title: ["Build", "Partnerships"], text: "Collaborate with organisations, institutions and governments.", icon: Handshake },
  { id: "discover", title: ["Explore", "Opportunities"], text: "Discover projects, programmes and emerging possibilities.", icon: Lightbulb },
];

/** Small corner drawing for each card; each shape rises in when the card is shown. */
function Corner({ id, color, play, reduce }: { id: PathwayId; color: string; play: boolean; reduce: boolean }) {
  const grow = (i: number) => ({
    initial: reduce ? false : ({ scaleY: 0 } as const),
    animate: play || reduce ? { scaleY: 1 } : { scaleY: 0 },
    transition: { duration: 0.7, delay: 0.2 + i * 0.1, ease: EASE },
    style: { transformOrigin: "bottom", transformBox: "fill-box" as const },
  });
  const pop = (i: number) => ({
    initial: reduce ? false : ({ scale: 0, opacity: 0 } as const),
    animate: play || reduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 240, damping: 15, delay: 0.2 + i * 0.12 },
    style: { transformOrigin: "center", transformBox: "fill-box" as const },
  });

  return (
    <svg viewBox="0 0 100 80" aria-hidden className="absolute right-0 bottom-0 h-[82px] w-[104px]">
      {id === "invest"
        ? [18, 30, 44, 58].map((h, i) => <motion.rect key={h} x={22 + i * 18} y={80 - h} width={12} height={h} rx={2} fill={color} opacity={0.25 + i * 0.18} {...grow(i)} />)
        : null}
      {id === "connect"
        ? [
            [30, 52, 22],
            [56, 40, 28],
            [80, 56, 18],
          ].map(([x, y, w], i) => <motion.rect key={x} x={x - w / 2} y={y} width={w} height={80 - y} rx={4} fill={color} opacity={0.25 + i * 0.2} {...grow(i)} />)
        : null}
      {id === "talent"
        ? [
            "M30 80 L52 40 L74 80 Z",
            "M58 80 L76 52 L94 80 Z",
            "M14 80 L28 58 L42 80 Z",
          ].map((d, i) => <motion.path key={d} d={d} fill={color} opacity={0.5 - i * 0.12} {...pop(i)} />)
        : null}
      {id === "partner"
        ? [
            [40, 54],
            [66, 54],
            [53, 32],
          ].map(([x, y], i) => (
            <motion.g key={`${x}-${y}`} {...pop(i)}>
              <rect x={x - 12} y={y - 12} width={24} height={24} rx={5} fill={color} opacity={0.3 + i * 0.18} />
              <circle cx={x + 12} cy={y} r={5} fill={color} opacity={0.3 + i * 0.18} />
            </motion.g>
          ))
        : null}
      {id === "discover" ? (
        <>
          {[0, 1, 2].map((i) => (
            <motion.rect key={i} x={30 + i * 20} y={62 - i * 16} width={20} height={18 + i * 16} fill={color} opacity={0.22 + i * 0.16} {...grow(i)} />
          ))}
          <motion.path d="M30 50 L82 16 M66 14 L84 15 L80 32" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" {...pop(3)} />
        </>
      ) : null}
    </svg>
  );
}

export function FivePathways({ reduce }: { reduce: boolean }) {
  const rowRef = useRef<HTMLUListElement>(null);
  const inView = useInView(rowRef, { once: true, amount: 0.3 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused || !inView) return;
    const id = window.setInterval(() => setActive((v) => (v + 1) % CARDS.length), 2200);
    return () => window.clearInterval(id);
  }, [reduce, paused, inView]);

  const go = (step: number) => {
    setPaused(true);
    setActive((v) => {
      const next = (v + step + CARDS.length) % CARDS.length;
      const row = rowRef.current;
      const card = row?.children[next] as HTMLElement | undefined;
      if (row && card) row.scrollTo({ left: card.offsetLeft - row.offsetLeft, behavior: reduce ? "auto" : "smooth" });
      return next;
    });
  };

  return (
    <section id="pathways" className="bg-white px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <HorizonTitle
          reduce={reduce}
          sub="Discover your pathway and be part of Karnataka's global journey."
          aside={
            <div className="flex items-end gap-6">
              <AsideNote lines={["Different goals. A shared future.", "Choose what you want to do."]} />
              <PrevNext onPrev={() => go(-1)} onNext={() => go(1)} />
            </div>
          }
        >
          Five Pathways. One Karnataka.
        </HorizonTitle>

        <ul
          ref={rowRef}
          className="-mx-5 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pt-3 pb-6 [scrollbar-width:none] xl:mx-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:px-0"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {CARDS.map(({ id, title, text, icon: CardIcon }, i) => {
            const { c, soft } = HZ_COLOR[id];
            const on = i === active;
            return (
              <motion.li key={id} className="w-[250px] shrink-0 snap-start xl:w-auto" {...rise(reduce, i * 0.08, 0.3)}>
                <Link
                  to={pathwayHref(id)}
                  onFocus={() => setActive(i)}
                  className={cn(
                    "group relative flex h-full min-h-[290px] flex-col overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-500 hover:-translate-y-1.5",
                    on ? "-translate-y-1.5 shadow-[0_22px_44px_rgba(13,34,83,0.14)]" : "border-(color:--gc-line) shadow-[0_8px_22px_rgba(13,34,83,0.06)]",
                  )}
                  style={{
                    borderColor: on ? c : undefined,
                    backgroundImage: `linear-gradient(160deg, #ffffff 45%, ${soft} 100%)`,
                  }}
                >
                  <motion.span
                    className="grid size-12 place-items-center rounded-xl"
                    style={{ background: soft, color: c }}
                    animate={on && !reduce ? { y: [0, -5, 0], rotate: [0, -6, 0] } : { y: 0, rotate: 0 }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                  >
                    <CardIcon size={28} weight="duotone" />
                  </motion.span>
                  <span className="mt-4 text-[13px] font-extrabold" style={{ color: c }}>
                    0{i + 1}
                  </span>
                  <h3 className="mt-1 font-display text-[18px] leading-snug font-bold text-(color:--gc-ink)">
                    {title[0]}
                    <br />
                    {title[1]}
                  </h3>
                  <p className="mt-2 max-w-[190px] text-[13px] leading-relaxed text-(color:--gc-body)">{text}</p>
                  <ArrowDot color={c} className="mt-auto" />
                  <Corner id={id} color={c} play={inView} reduce={reduce} />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 origin-left transition-transform duration-700"
                    style={{ background: c, transform: `scaleX(${on ? 1 : 0})` }}
                  />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
