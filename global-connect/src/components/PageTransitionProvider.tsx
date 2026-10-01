import { useCallback, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PageTransitionContext, type CardTransition } from "@/lib/pageTransition";

const EASE = [0.65, 0, 0.35, 1] as const;

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<CardTransition | null>(null);
  const [revealing, setRevealing] = useState(false);

  const start = useCallback(
    (t: CardTransition) => {
      if (reduce) {
        navigate(t.to);
        return;
      }
      setRevealing(false);
      setActive(t);
    },
    [navigate, reduce],
  );

  return (
    <PageTransitionContext.Provider value={start}>
      {children}
      <AnimatePresence>
        {active && !revealing ? (
          <ExpandingCard
            key={active.to}
            t={active}
            onExpanded={() => {
              navigate(active.to);
              setRevealing(true);
            }}
          />
        ) : null}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
}

function ExpandingCard({ t, onExpanded }: { t: CardTransition; onExpanded: () => void }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { top, left, width, height } = t.rect;
  const grow = 0.04;

  return (
    <motion.div
      className="fixed z-[80] overflow-hidden bg-[#061536] shadow-[0_30px_80px_rgba(3,10,30,0.45)]"
      initial={{ top, left, width, height, borderRadius: 16, opacity: 1 }}
      animate={{
        top: [top, top - (height * grow) / 2, 0],
        left: [left, left - (width * grow) / 2, 0],
        width: [width, width * (1 + grow), vw],
        height: [height, height * (1 + grow), vh],
        borderRadius: [16, 18, 0],
      }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
      transition={{ duration: 0.75, times: [0, 0.3, 1], ease: EASE }}
      onAnimationComplete={onExpanded}
    >
      <motion.img
        src={t.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,21,54,0.35),rgba(6,21,54,0.85))]" />
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
      >
        <span className="mb-3 h-1 w-12 rounded-full" style={{ background: t.color }} />
        <span className="font-display text-[28px] font-bold tracking-[-0.02em] sm:text-[40px]">{t.title}</span>
      </motion.div>
    </motion.div>
  );
}
