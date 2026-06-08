// Attach an ink-drop ripple animation on click. Use via onClick={withRipple(handler)}.
import type { MouseEvent } from "react";

export function triggerRipple(e: MouseEvent<HTMLElement>) {
  const host = e.currentTarget;
  host.classList.add("ripple-host");
  const rect = host.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "ripple-dot";
  const size = Math.max(rect.width, rect.height) * 0.4;
  dot.style.width = `${size}px`;
  dot.style.height = `${size}px`;
  dot.style.left = `${e.clientX - rect.left}px`;
  dot.style.top = `${e.clientY - rect.top}px`;
  host.appendChild(dot);
  setTimeout(() => dot.remove(), 700);
}

export function withRipple<T extends (e: MouseEvent<HTMLElement>) => void>(handler?: T) {
  return (e: MouseEvent<HTMLElement>) => {
    triggerRipple(e);
    handler?.(e);
  };
}
