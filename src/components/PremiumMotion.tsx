import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: reduced ? 0 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function AnimatedTitle({ text, className = "" }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  return <h1 className={className} aria-label={text}><span aria-hidden="true">{text.split(" ").map((word, wi) => <span key={wi} className="inline-block whitespace-nowrap">{Array.from(word).map((letter, li) => <motion.span key={li} className="inline-block" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: reduced ? 0 : wi * 0.08 + li * 0.025 }}>{letter}</motion.span>)}{wi < text.split(" ").length - 1 ? "\u00a0" : ""}</span>)}</span></h1>;
}