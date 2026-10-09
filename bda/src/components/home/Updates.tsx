import { ArrowSquareOut, CaretRight, FilePdf, Gavel, MapTrifold, Megaphone } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import {
  ANNOUNCEMENTS,
  ANNOUNCEMENT_TABS,
  EAUCTION_LINKS,
  LAYOUT_LINKS,
  SITE,
  type AnnouncementTab,
  type LinkItem,
} from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn, dateParts, external } from "@/lib/utils";
import { Container, Reveal, SectionHeader } from "./shared";

const TEXT = {
  announcements: { en: "Announcements", kn: "ಪ್ರಕಟಣೆಗಳು" },
  eauction: { en: "E-Auction", kn: "ಇ-ಹರಾಜು" },
  layouts: { en: "BDA Layouts & Land", kn: "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು ಮತ್ತು ಭೂಮಿ" },
  link: { en: "Online", kn: "ಆನ್‌ಲೈನ್" },
};

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("h-full rounded-xl border border-line bg-white p-4 shadow-sm md:p-5", className)}>{children}</div>;
}

export function AnnouncementTabs({
  tab,
  onChange,
  className,
}: {
  tab: AnnouncementTab;
  onChange: (tab: AnnouncementTab) => void;
  className?: string;
}) {
  const { t } = useLang();
  const { pick } = useDesign();
  return (
    <div role="tablist" className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-lg bg-[#eef3fb] p-1", className)}>
      {ANNOUNCEMENT_TABS.map((tb) => (
        <button
          key={tb.key}
          role="tab"
          type="button"
          aria-selected={tab === tb.key}
          onClick={() => onChange(tb.key)}
          className={cn(
            "relative flex-1 shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            tab === tb.key ? "text-white" : "text-muted hover:bg-brand hover:text-white",
          )}
        >
          {tab === tb.key && (
            <motion.span
              layoutId="announcement-tab"
              className={cn("absolute inset-0 rounded-md shadow-sm", pick("bg-brand", "bg-navy"))}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative">{t(tb.label)}</span>
        </button>
      ))}
    </div>
  );
}

export function Announcements({ limit = 5 }: { limit?: number }) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<AnnouncementTab>("all");
  const items = ANNOUNCEMENTS.filter((a) => tab === "all" || a.tab === tab).slice(0, limit);

  return (
    <Card>
      <SectionHeader icon={Megaphone} title={TEXT.announcements} href={`${SITE}/news`} />
      <AnnouncementTabs tab={tab} onChange={setTab} className="mb-2" />
      <ul className="divide-y divide-line">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((a) => {
            const d = dateParts(a.date, lang);
            return (
              <motion.li
                key={a.href + a.date}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <a href={a.href} {...external(a.href)} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors duration-200 hover:bg-brand">
                  <span className="w-14 shrink-0 rounded-md bg-brand-soft py-1 text-center transition-all duration-300 group-hover:bg-white/15 group-hover:[&>span]:text-white">
                    <span className="block font-display text-lg font-bold leading-none text-navy">{d.day}</span>
                    <span className="mt-0.5 block text-[9.5px] font-semibold uppercase text-muted">{d.monthYear}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:text-white">{t(a.title)}</span>
                    <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-muted group-hover:text-white/85">
                      {a.pdf ? (
                        <>
                          <FilePdf weight="fill" className="size-3.5 text-red-600" /> PDF
                        </>
                      ) : (
                        <>
                          <ArrowSquareOut weight="bold" className="size-3.5 text-brand group-hover:text-white" /> {t(TEXT.link)}
                        </>
                      )}
                    </span>
                  </span>
                  <CaretRight weight="bold" className="size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </a>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

function LinkCard({ icon, title, href, image, links }: { icon: typeof Gavel; title: Text; href: string; image: string; links: LinkItem[] }) {
  const { t } = useLang();
  return (
    <Card>
      <SectionHeader icon={icon} title={title} href={href} />
      <div className="overflow-hidden rounded-lg">
        <img src={asset(image)} alt="" loading="lazy" className="h-36 w-full object-cover transition-transform duration-500 hover:scale-105" />
      </div>
      <ul className="mt-2 divide-y divide-line">
        {links.map((l) => (
          <li key={l.label.en}>
            <a href={l.href} {...external(l.href)} className="group -mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-brand hover:text-white">
              {t(l.label)}
              <CaretRight weight="bold" className="size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Updates({ images }: { images?: [string, string] }) {
  const { pick } = useDesign();
  const [auctionImage, layoutImage] = images ?? [pick(PHOTOS.flats, PHOTOS.layoutSigns), pick(PHOTOS.towers, PHOTOS.layoutBoard)];
  return (
    <Container>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <Reveal>
          <Announcements />
        </Reveal>
        <Reveal delay={0.06}>
          <LinkCard
            icon={Gavel}
            title={TEXT.eauction}
            href={`${SITE}/e-auction`}
            image={auctionImage}
            links={EAUCTION_LINKS}
          />
        </Reveal>
        <Reveal delay={0.12}>
          <LinkCard
            icon={MapTrifold}
            title={TEXT.layouts}
            href={`${SITE}/bda-layout`}
            image={layoutImage}
            links={LAYOUT_LINKS}
          />
        </Reveal>
      </div>
    </Container>
  );
}
