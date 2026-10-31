"use client";

import { useEffect, useRef } from "react";
import { clamp } from "@/lib/utils";

const COLS = ["138,138,244", "45,212,191", "244,114,182"];

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
}
interface Pulse {
  a: Node;
  b: Node;
  p: number;
  sp: number;
  c: string;
}
interface Ripple {
  x: number;
  y: number;
  r: number;
  a: number;
  c: string;
}

/** Animated network of nodes, signals and ripples. Sizes itself to its parent element. */
export default function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const sec = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !sec || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    let W = 0,
      H = 0,
      LINK = 150,
      run = false,
      raf = 0;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let ripples: Ripple[] = [];
    const mouse = { x: -999, y: -999 };

    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = sec!.clientWidth;
      H = sec!.clientHeight;
      cv!.width = W * dpr;
      cv!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      LINK = W < 600 ? 105 : 150;
      const n = Math.round(clamp((W * H) / 15000, 26, 85));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1.5 + Math.random() * 2.3,
        c: COLS[Math.floor(Math.random() * 3)],
      }));
      pulses = [];
      ripples = [];
    }

    function frame() {
      const c = ctx!;
      c.clearRect(0, 0, W, H);
      const edges: [Node, Node][] = [];

      for (const n of nodes) {
        const dx = mouse.x - n.x,
          dy = mouse.y - n.y,
          d = Math.hypot(dx, dy);
        if (d < 200 && d > 1) {
          n.x += (dx / d) * 0.35;
          n.y += (dy / d) * 0.35;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      c.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j],
            d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            c.strokeStyle = `rgba(138,138,244,${(1 - d / LINK) * 0.32})`;
            c.beginPath();
            c.moveTo(a.x, a.y);
            c.lineTo(b.x, b.y);
            c.stroke();
            edges.push([a, b]);
          }
        }

      for (const n of nodes) {
        // cursor connects to nearby nodes
        const d = Math.hypot(mouse.x - n.x, mouse.y - n.y);
        if (d < 200) {
          c.strokeStyle = `rgba(244,114,182,${(1 - d / 200) * 0.55})`;
          c.beginPath();
          c.moveTo(mouse.x, mouse.y);
          c.lineTo(n.x, n.y);
          c.stroke();
        }
      }
      for (const n of nodes) {
        c.fillStyle = `rgba(${n.c},.75)`;
        c.beginPath();
        c.arc(n.x, n.y, n.r, 0, 6.283);
        c.fill();
      }

      if (edges.length && Math.random() < 0.09 && pulses.length < 26) {
        const e = edges[Math.floor(Math.random() * edges.length)];
        const f = Math.random() < 0.5;
        pulses.push({
          a: f ? e[0] : e[1],
          b: f ? e[1] : e[0],
          p: 0,
          sp: 0.012 + Math.random() * 0.014,
          c: COLS[Math.floor(Math.random() * 3)],
        });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const s = pulses[i];
        s.p += s.sp;
        if (s.p >= 1) {
          if (Math.random() < 0.6 && ripples.length < 8) ripples.push({ x: s.b.x, y: s.b.y, r: 3, a: 0.4, c: s.c });
          pulses.splice(i, 1);
          continue;
        }
        const x = s.a.x + (s.b.x - s.a.x) * s.p,
          y = s.a.y + (s.b.y - s.a.y) * s.p,
          g = c.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, `rgba(${s.c},.95)`);
        g.addColorStop(1, `rgba(${s.c},0)`);
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, 9, 0, 6.283);
        c.fill();
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 0.9;
        r.a -= 0.0065;
        if (r.a <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        c.strokeStyle = `rgba(${r.c},${r.a})`;
        c.beginPath();
        c.arc(r.x, r.y, r.r, 0, 6.283);
        c.stroke();
      }
    }

    function loop() {
      if (!run) return;
      frame();
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -999;
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      if (!run || reduce) frame();
    });
    ro.observe(sec);
    sec.addEventListener("pointermove", onMove);
    sec.addEventListener("pointerleave", onLeave);

    let io: IntersectionObserver | undefined;
    if (reduce) {
      frame();
    } else {
      io = new IntersectionObserver((es) => {
        const visible = es[0].isIntersecting;
        if (visible && !run) {
          run = true;
          loop();
        } else if (!visible) {
          run = false;
        }
      });
      io.observe(sec);
    }

    return () => {
      run = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      sec.removeEventListener("pointermove", onMove);
      sec.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas id="net" ref={ref} aria-hidden="true" />;
}
