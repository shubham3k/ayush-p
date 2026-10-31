"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { StripItem, StripSection } from "@/lib/config";
import { useVideoModal } from "./VideoModal";
import Reveal from "./Reveal";

const SECONDS_PER_CARD = 8;

function StripCard({ item, variant, hidden }: { item: StripItem; variant: string; hidden?: boolean }) {
  const { open } = useVideoModal();
  return (
    <button
      type="button"
      className={`reel ${variant}`}
      tabIndex={hidden ? -1 : 0}
      aria-label={`Watch ${item.title}`}
      onClick={() => open({ type: "video", src: item.full, url: item.full }, variant === "tall")}
    >
      <video
        src={item.loop}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
      />
      {item.caption && (
        <span className="rcap">
          <b>{item.title}</b>
          <small>{item.caption}</small>
        </span>
      )}
    </button>
  );
}

/**
 * A section whose videos play live and glide right to left in an endless loop.
 * Playback starts when the strip scrolls into view; click a card to watch the full video.
 */
export default function VideoStrip({ section }: { section: StripSection }) {
  const { id, label, title, lead, variant, items } = section;
  const stripRef = useRef<HTMLDivElement>(null);

  // Each half of the track must be wider than the screen, otherwise the loop shows a gap.
  // (~2600px covers ultra-wide screens: 9 tall cards of ~308px, or 6 wide cards of ~498px.)
  const minCards = variant === "wide" ? 6 : 9;
  const repeat = Math.max(1, Math.ceil(minCards / items.length));
  const cards = Array.from({ length: repeat }, (_, r) => items.map((it) => ({ it, key: `${it.id}-${r}` }))).flat();

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.querySelectorAll("video").forEach((v) => {
          if (entry.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Reveal as="section" className="sec" id={id}>
      <div className="eyebrow mono">{label}</div>
      <h2>{title}</h2>
      <p className="lead">{lead}</p>
      <div className="reels" ref={stripRef}>
        <div className="reel-track" style={{ animationDuration: `${cards.length * SECONDS_PER_CARD}s` } as CSSProperties}>
          <div className="reel-set">
            {cards.map(({ it, key }) => (
              <StripCard key={key} item={it} variant={variant} />
            ))}
          </div>
          <div className="reel-set" aria-hidden="true">
            {cards.map(({ it, key }) => (
              <StripCard key={key} item={it} variant={variant} hidden />
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
