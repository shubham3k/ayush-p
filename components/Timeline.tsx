"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Clip, Config } from "@/lib/config";
import { clamp, p2, scrollToId } from "@/lib/utils";
import Reveal from "./Reveal";

const ROW_H = 44;
const FPS = 24;
const SPEED = 2.2; // timeline seconds per real second

/** Deterministic pseudo-random waveform so server and client render identically. */
function Wave({ n, seed }: { n: number; seed: number }) {
  let d = "";
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const a = 0.12 + (x / 233280) * 0.88;
    const env = 0.55 + 0.45 * Math.sin((i / n) * Math.PI * 3 + seed);
    const h = Math.max(0.5, a * env * 8.5);
    d += `M${i} ${(10 - h).toFixed(1)}V${(10 + h).toFixed(1)}`;
  }
  return (
    <svg viewBox={`0 0 ${n} 20`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.1" vectorEffect="non-scaling-stroke" fill="none" />
    </svg>
  );
}

interface Pos {
  s: number;
  t: number;
}
interface Drag {
  idx: number;
  ns: number;
  dy: number;
}

export default function Timeline({ config }: { config: Config }) {
  const { duration: D, tracks, clips, palette, transitions, project } = config;

  const [pos, setPos] = useState<Pos[]>(() => clips.map((c) => ({ s: c.s, t: c.t })));
  const [shown, setShown] = useState<boolean[]>(() => clips.map(() => false));
  const [done, setDone] = useState<boolean[]>(() => clips.map(() => false));
  const [drag, setDrag] = useState<Drag | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);

  const mainRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const playingRef = useRef(true);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrubbing = useRef(false);
  const gesture = useRef<{ idx: number; sx: number; sy: number; moved: boolean; ns: number; dy: number } | null>(null);

  const setPlay = useCallback((v: boolean) => {
    playingRef.current = v;
    setPlaying(v);
  }, []);

  // entrance animation, staggered
  useEffect(() => {
    const timers = clips.map((_, k) =>
      setTimeout(() => setShown((s) => s.map((v, i) => (i === k ? true : v))), 600 + k * 70),
    );
    return () => timers.forEach(clearTimeout);
  }, [clips]);

  // playhead loop
  useEffect(() => {
    let raf = 0;
    let last: number | null = null;
    const tick = (ts: number) => {
      if (last === null) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      if (playingRef.current) timeRef.current = (timeRef.current + dt * SPEED) % D;
      setTime(timeRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeRef.current);
    };
  }, [D]);

  /* ----- ruler scrubbing ----- */
  const seek = (ev: PointerEvent) => {
    const r = mainRef.current!.getBoundingClientRect();
    timeRef.current = clamp(((ev.clientX - r.left) / r.width) * D, 0, D - 0.01);
    setTime(timeRef.current);
  };
  const scrubDown = (ev: PointerEvent<HTMLDivElement>) => {
    scrubbing.current = true;
    setPlay(false);
    clearTimeout(resumeRef.current);
    ev.currentTarget.setPointerCapture(ev.pointerId);
    seek(ev);
  };
  const scrubMove = (ev: PointerEvent<HTMLDivElement>) => {
    if (scrubbing.current) seek(ev);
  };
  const scrubEnd = () => {
    if (!scrubbing.current) return;
    scrubbing.current = false;
    resumeRef.current = setTimeout(() => setPlay(true), 2000);
  };

  /* ----- clip dragging (any direction) ----- */
  const clipDown = (ev: PointerEvent<HTMLButtonElement>, idx: number) => {
    if (ev.button) return;
    gesture.current = { idx, sx: ev.clientX, sy: ev.clientY, moved: false, ns: pos[idx].s, dy: 0 };
    ev.currentTarget.setPointerCapture(ev.pointerId);
    setDrag({ idx, ns: pos[idx].s, dy: 0 });
  };
  const clipMove = (ev: PointerEvent<HTMLButtonElement>, idx: number) => {
    const g = gesture.current;
    if (!g || g.idx !== idx) return;
    const dx = ev.clientX - g.sx;
    const dy = ev.clientY - g.sy;
    if (!g.moved && Math.hypot(dx, dy) < 4) return;
    g.moved = true;
    const w = mainRef.current!.getBoundingClientRect().width;
    g.ns = clamp(pos[idx].s + (dx / w) * D, 0, D - clips[idx].l);
    g.dy = dy;
    setDrag({ idx, ns: g.ns, dy });
  };
  const clipUp = (idx: number) => {
    const g = gesture.current;
    if (!g || g.idx !== idx) return;
    gesture.current = null;
    setDrag(null);
    if (!g.moved) {
      const link = clips[idx].link;
      if (link) scrollToId(link);
      return;
    }
    const nt = clamp(Math.round(pos[idx].t + g.dy / ROW_H), 0, tracks.length - 1);
    setPos((p) => p.map((v, i) => (i === idx ? { s: g.ns, t: nt } : v)));
  };

  const reset = () => setPos(clips.map((c) => ({ s: c.s, t: c.t })));

  /* ----- derived display state ----- */
  const frames = Math.floor(time * FPS);
  const timecode = `00:00:${p2(Math.floor(time))}:${p2(frames % FPS)}`;
  const isOn = (i: number) => time >= pos[i].s && time < pos[i].s + clips[i].l;
  let nowLabel = "";
  clips.forEach((c, i) => {
    if (pos[i].t === 3 && isOn(i)) nowLabel = c.label;
  });

  const renderClip = (c: Clip, i: number) => {
    const dragging = drag?.idx === i;
    const left = dragging ? drag.ns : pos[i].s;
    const cls = ["clip", c.k, shown[i] && "in", done[i] && "done", isOn(i) && "on", dragging && "drag"]
      .filter(Boolean)
      .join(" ");
    const style: CSSProperties & Record<string, string> = {
      left: `${(left / D) * 100}%`,
      width: `${(c.l / D) * 100}%`,
      "--c": `var(${c.c})`,
    };
    if (c.k === "v" || c.k === "g") style.backgroundColor = `var(${c.c})`;
    if (dragging) style.translate = `0 ${drag.dy}px`;

    return (
      <button
        key={i}
        type="button"
        className={cls}
        style={style}
        aria-label={c.label + (c.link ? " – go to section" : "")}
        onPointerDown={(e) => clipDown(e, i)}
        onPointerMove={(e) => clipMove(e, i)}
        onPointerUp={() => clipUp(i)}
        onPointerCancel={() => clipUp(i)}
        onAnimationEnd={() => setDone((d) => (d[i] ? d : d.map((v, k) => (k === i ? true : v))))}
        onClick={(e) => {
          if (e.detail === 0 && c.link) scrollToId(c.link);
        }}
      >
        {(c.k === "au" || c.k === "sf") && <Wave n={c.k === "sf" ? 14 : Math.round(c.l * 5)} seed={i * 7 + 3} />}
        <span>{c.label}</span>
        {c.k === "adj" && (
          <span className="sw">
            {palette.map((p) => (
              <u key={p} style={{ background: p }} />
            ))}
          </span>
        )}
      </button>
    );
  };

  return (
    <Reveal as="section" className="tl" ariaLabel="Editing timeline">
      <div className="bar mono">
        <i />
        <i />
        <i />
        <span style={{ marginLeft: 8 }}>{project}</span>
        <button
          className="pp mono"
          aria-label="Play or pause"
          onClick={() => {
            clearTimeout(resumeRef.current);
            setPlay(!playingRef.current);
          }}
        >
          {playing ? "❚❚ pause" : "▶ play"}
        </button>
        <button className="pp mono" aria-label="Reset timeline" onClick={reset}>
          ↺ reset
        </button>
        <span className="now mono">{nowLabel && `▶ ${nowLabel}`}</span>
        <span className="t">{timecode}</span>
      </div>

      <div className="scroll">
        <div className="grid">
          <div className="lab">
            <div className="r" />
            {tracks.map((tr) => (
              <div key={tr.n} className="mono">
                <b>{tr.n}</b>
                {tr.d.slice(0, 6)}
              </div>
            ))}
          </div>
          <div className="main" ref={mainRef}>
            <div
              className="ruler"
              onPointerDown={scrubDown}
              onPointerMove={scrubMove}
              onPointerUp={scrubEnd}
              onPointerCancel={scrubEnd}
            >
              {Array.from({ length: Math.ceil(D / 5) }, (_, n) => n * 5).map((s) => (
                <span key={s} className="mono" style={{ left: `${(s / D) * 100}%` }}>
                  00:{p2(s)}
                </span>
              ))}
            </div>
            {tracks.map((tr, ti) => (
              <div className="row" key={tr.n}>
                {clips.map((c, i) => (pos[i].t === ti ? renderClip(c, i) : null))}
                {ti === 3 &&
                  transitions.map((s) => <i key={s} className="trd" style={{ left: `${(s / D) * 100}%` }} />)}
              </div>
            ))}
            <div className="head" style={{ left: `${(time / D) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="legend mono">
        <span>
          <i style={{ background: "var(--accent)" }} />
          Video
        </span>
        <span>
          <i style={{ background: "var(--a3)" }} />
          Graphics / titles
        </span>
        <span>
          <i style={{ background: "var(--a4)" }} />
          Adjustment · color grade
        </span>
        <span>
          <i style={{ background: "var(--a2)" }} />
          Audio · music
        </span>
        <span>
          <i style={{ background: "var(--text)" }} />
          SFX &amp; transitions
        </span>
        <span>Drag any clip left, right, up or down · drag the ruler to scrub · click a clip to jump to that work</span>
      </div>
    </Reveal>
  );
}
