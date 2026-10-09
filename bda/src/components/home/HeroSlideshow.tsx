import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const SLIDES: { image: string; label: Text; position?: string }[] = [
  { image: PHOTOS.headOffice, label: t2("BDA Head Office, Kumara Park West", "ಬಿಡಿಎ ಕೇಂದ್ರ ಕಚೇರಿ, ಕುಮಾರ ಪಾರ್ಕ್ ಪಶ್ಚಿಮ") },
  { image: PHOTOS.towers, label: t2("BDA Apartment Towers", "ಬಿಡಿಎ ವಸತಿ ಗೋಪುರಗಳು") },
  { image: PHOTOS.layoutSigns, label: t2("Nadaprabhu Kempegowda Layout", "ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಬಡಾವಣೆ") },
  { image: PHOTOS.villa, label: t2("BDA Villas", "ಬಿಡಿಎ ವಿಲ್ಲಾಗಳು"), position: "object-[center_35%]" },
  { image: PHOTOS.layoutBoard, label: t2("Planned Layout Development", "ಯೋಜಿತ ಬಡಾವಣೆ ಅಭಿವೃದ್ಧಿ"), position: "object-left" },
  { image: PHOTOS.flats, label: t2("BDA Housing Complex", "ಬಿಡಿಎ ವಸತಿ ಸಮುಚ್ಚಯ") },
];

const DURATION = 5000;
const GO_TO = t2("Show photo", "ಫೋಟೋ ತೋರಿಸಿ");

export function HeroSlideshow({ className }: { className?: string }) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[index];

  useEffect(() => {
    SLIDES.slice(1).forEach((s) => {
      new Image().src = asset(s.image);
    });
  }, []);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn("relative overflow-hidden bg-brand-soft", className)}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={asset(slide.image)}
          alt={t(slide.label)}
          initial={{ opacity: 0, scale: 1.14 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2, ease: "easeInOut" }, scale: { duration: 7, ease: "linear" } }}
          className={cn("absolute inset-0 size-full object-cover", slide.position ?? "object-center")}
        />
      </AnimatePresence>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy-deep/75 to-transparent" aria-hidden />

      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-navy shadow-sm backdrop-blur"
          >
            {t(slide.label)}
          </motion.span>
        </AnimatePresence>
        <div className="flex shrink-0 items-center gap-1.5 pb-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              aria-label={`${t(GO_TO)} ${i + 1}: ${t(s.label)}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-500",
                i === index ? "w-7 bg-white/40" : "w-1.5 bg-white/60 hover:bg-white",
              )}
            >
              {i === index && !reduce && (
                <span
                  key={index}
                  onAnimationEnd={() => setIndex((n) => (n + 1) % SLIDES.length)}
                  className="absolute inset-0 origin-left rounded-full bg-white"
                  style={{ animation: `grow ${DURATION}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
