import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EASE } from "@/components/home/shared";
import { asset, cn } from "@/lib/utils";

export function PhotoBackdrop({ image, position = "object-center" }: { image: string; position?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE }}
        className="absolute inset-0"
      >
        <motion.img src={asset(image)} alt="" style={{ y, scale: 1.16 }} className={cn("size-full object-cover opacity-45", position)} />
        <span className="absolute inset-0 bg-brand opacity-30 mix-blend-color" />
      </motion.div>
      <span className="absolute inset-0 bg-gradient-to-r from-page/35 via-page/80 to-page" />
      <span className="absolute inset-0 bg-gradient-to-b from-page via-transparent to-page" />
    </div>
  );
}
