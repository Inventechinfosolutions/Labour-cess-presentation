import { ArrowUp } from "@phosphor-icons/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useState } from "react";
import { useLang } from "@/lib/i18n";

const TOP = { en: "Back to top", kn: "ಮೇಲಕ್ಕೆ ಹಿಂತಿರುಗಿ" };

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand via-brand-bright to-sky-400"
    />
  );
}

export function BackToTop() {
  const { t } = useLang();
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 700));
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          title={t(TOP)}
          aria-label={t(TOP)}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="fixed bottom-4 right-4 z-40 grid size-11 place-items-center rounded-full bg-navy text-white shadow-[0_10px_24px_-8px_rgba(11,44,107,0.6)] hover:bg-brand"
        >
          <ArrowUp weight="bold" className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
