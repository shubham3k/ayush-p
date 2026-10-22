"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Config } from "@/lib/config";

const COLS = ["--accent", "--a3", "--a2", "--a4"];

export default function Hero({ config }: { config: Config }) {
  const heroRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const tilt = tiltRef.current;
    if (!hero || !tilt || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.setProperty("--ry", `${x * 26}deg`);
      tilt.style.setProperty("--rx", `${-16 - y * 14}deg`);
    };
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <header className="hero" id="hero" ref={heroRef}>
      <div className="scene" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="tilt" ref={tiltRef}>
          <div className="ring">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="fr mono"
                style={{ "--i": i, "--c": `var(${COLS[i % 4]})` } as CSSProperties}
              >
                <span>REC ●</span>
                <span>
                  00:0{i}:{10 + i * 3}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="wrap" style={{ width: "100%" }}>
        <nav>
          <div className="links">
            <a href="#about">About</a>
            <a href="#work-short">Work</a>
            <a href="#testimonials">Testimonials</a>
            <a className="btn" href="#connect">
              Hire me
            </a>
          </div>
        </nav>
      </div>
      <div className="wrap heroin">
        <div>
          <h1>
            {config.headlineA}
            <br />
            <span>{config.headlineB}</span>
          </h1>
          <p className="sub">{config.tagline}</p>
          <div className="cta">
            <a className="p" href="#work-short">
              View my work
            </a>
            <a className="s" href="#connect">
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
