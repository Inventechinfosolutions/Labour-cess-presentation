import { Desktop, LinkSimple } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { ONLINE_SERVICES, QUICK_LINKS, SITE } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { ONLINE_ICONS, QUICK_ICONS } from "@/lib/icons";
import { cn, external } from "@/lib/utils";
import { Container, Reveal, SectionHeader } from "./shared";

const TEXT = {
  online: { en: "Online Services", kn: "ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು" },
  quick: { en: "Quick Links", kn: "ತ್ವರಿತ ಕೊಂಡಿಗಳು" },
};

const PANEL = "rounded-xl border border-line bg-white p-4 shadow-sm md:p-6";

function useTile() {
  const { pick } = useDesign();
  return cn(
    "group flex h-full rounded-lg border transition-[background-color,border-color,box-shadow,translate] duration-300 hover:-translate-y-1",
    pick(
      "border-line bg-white hover:border-brand hover:bg-brand hover:shadow-md",
      "border-transparent bg-[#eef3fb] hover:border-brand hover:bg-brand hover:shadow-md",
    ),
  );
}

const pop = (i: number) => ({
  initial: { opacity: 0, y: 16, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-40px" },
  transition: { delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
});

export function OnlineServices() {
  const { t } = useLang();
  const tile = useTile();
  return (
    <Container>
      <Reveal className={PANEL}>
        <SectionHeader icon={Desktop} title={TEXT.online} href={`${SITE}/online-services`} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
          {ONLINE_SERVICES.map((s, i) => {
            const Icon = ONLINE_ICONS[s.icon];
            return (
              <motion.a key={s.label.en} href={s.href} {...external(s.href)} {...pop(i)} className={cn(tile, "items-center gap-3 px-3.5 py-3")}>
                <Icon weight="duotone" className="size-7 shrink-0 text-brand transition-[color,rotate,scale] duration-300 group-hover:-rotate-6 group-hover:scale-115 group-hover:text-white" />
                <span className="text-[13px] font-medium leading-snug text-ink transition-colors group-hover:text-white">{t(s.label)}</span>
              </motion.a>
            );
          })}
        </div>
      </Reveal>
    </Container>
  );
}

export function QuickLinks() {
  const { t } = useLang();
  const tile = useTile();
  return (
    <Container className="pt-6 md:pt-6">
      <Reveal className={PANEL}>
        <SectionHeader icon={LinkSimple} title={TEXT.quick} href={SITE} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {QUICK_LINKS.map((q, i) => {
            const Icon = QUICK_ICONS[q.icon];
            return (
              <motion.a key={q.label.en} href={q.href} {...external(q.href)} {...pop(i)} className={cn(tile, "flex-col items-center gap-2 px-2 py-4 text-center")}>
                <Icon weight="duotone" className="size-8 text-brand transition-[color,translate,scale] duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-white" />
                <span className="text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover:text-white">{t(q.label)}</span>
              </motion.a>
            );
          })}
        </div>
      </Reveal>
    </Container>
  );
}
