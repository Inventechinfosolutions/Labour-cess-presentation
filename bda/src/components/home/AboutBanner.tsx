import { ArrowRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { ABOUT } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn, external } from "@/lib/utils";
import { CountUp, EASE, Reveal } from "./shared";

const PHOTO_FADE = {
  maskImage: "linear-gradient(to right, transparent 0%, black 22%), linear-gradient(to bottom, transparent 0%, black 45%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 22%), linear-gradient(to bottom, transparent 0%, black 45%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

export function AboutBanner({ image }: { image?: string }) {
  const { t } = useLang();
  const { pick } = useDesign();
  return (
    <section className={cn("relative mt-16 overflow-hidden border-t border-line md:mt-20", pick("bg-gradient-to-r from-[#e3edff] via-[#eef4ff] to-[#f6f9ff]", "bg-[#eaf2ff]"))}>
      <motion.img
        src={asset(image ?? pick(PHOTOS.villa, PHOTOS.flats))}
        alt=""
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.1, ease: EASE }}
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover lg:block"
        style={PHOTO_FADE}
      />
      <Reveal className="relative mx-auto max-w-site px-5 py-12 md:py-16 lg:px-8">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-bold text-navy md:text-3xl">{t(ABOUT.title)}</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink/80">{t(ABOUT.body)}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ABOUT.stats.map((s) => (
              <div key={s.value}>
                <dt className="font-display text-xl font-bold text-brand md:text-2xl">
                  <CountUp value={s.value} />
                </dt>
                <dd className="mt-0.5 text-[11.5px] leading-snug text-muted">{t(s.label)}</dd>
              </div>
            ))}
          </dl>
          <motion.a
            href={ABOUT.href}
            {...external(ABOUT.href)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "group relative mt-7 inline-flex items-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors",
              pick("bg-brand-bright hover:bg-brand", "bg-navy hover:bg-brand"),
            )}
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden />
            <span className="relative">{t(ABOUT.cta)}</span>
            <ArrowRight weight="bold" className="relative transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>
      </Reveal>
    </section>
  );
}
