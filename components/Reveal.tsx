"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface Props {
  as?: "section" | "div";
  id?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  children: ReactNode;
}

/** Fades/slides its content in the first time it scrolls into view. */
export default function Reveal({ as: Tag = "div", id, className = "", style, ariaLabel, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add("show");
            io.unobserve(x.target);
          }
        });
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`${className} rv`.trim()}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
