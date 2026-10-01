import { createContext, useContext, type MouseEvent } from "react";

export type CardTransition = {
  rect: DOMRect;
  image: string;
  title: string;
  color: string;
  to: string;
};

export const PageTransitionContext = createContext<(t: CardTransition) => void>(() => {});

/** Click handler for a card link that expands the card into the next page. */
export function useCardTransition() {
  const start = useContext(PageTransitionContext);
  return (e: MouseEvent<HTMLElement>, t: Omit<CardTransition, "rect">) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    start({ ...t, rect: e.currentTarget.getBoundingClientRect() });
  };
}
