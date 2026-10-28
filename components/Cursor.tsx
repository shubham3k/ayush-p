"use client";

import { useEffect, useRef } from "react";

/** Trailing ring cursor, desktop (fine pointer + hover) only. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cur = ref.current;
    if (!cur) return;
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (!fine || reduce) return;

    cur.style.display = "block";
    let cx = 0,
      cy = 0,
      tx = 0,
      ty = 0,
      raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as Element | null;
      cur.classList.toggle("big", !!target?.closest("a,button,.clip,.card,.reel,.ruler,label,select"));
    };
    const loop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", onMove);
    loop();
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      cur.style.display = "none";
    };
  }, []);

  return <div id="cur" ref={ref} aria-hidden="true" />;
}
