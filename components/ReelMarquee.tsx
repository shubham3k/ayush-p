"use client";

import { useEffect, useRef } from "react";
import type { Config } from "@/lib/config";
import { useVideoModal } from "./VideoModal";
import Reveal from "./Reveal";

type Reel = Config["reels"][number];

function ReelCard({ reel, hidden }: { reel: Reel; hidden?: boolean }) {
  const { open } = useVideoModal();
  return (
    <button
      type="button"
      className="reel"
      tabIndex={hidden ? -1 : 0}
      aria-label={`Watch ${reel.title}`}
      onClick={() => open({ type: "video", src: reel.full, url: reel.full }, true)}
    >
      <video
        src={reel.loop}
        poster={reel.poster}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
      />
    </button>
  );
}

/**
 * Short-form section: reels play live and glide right to left in an endless loop.
 * Playback starts when the section scrolls into view; click a reel to watch the full video.
 */
export default function ReelMarquee({ config }: { config: Config }) {
  const { shortForm: s, reels } = config;
  const stripRef = useRef<HTMLDivElement>(null);

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
    <Reveal as="section" className="sec" id={s.id}>
      <div className="eyebrow mono">{s.label}</div>
      <h2>{s.title}</h2>
      <p className="lead">{s.lead}</p>
      <div className="reels" ref={stripRef}>
        <div className="reel-track">
          <div className="reel-set">
            {reels.map((r) => (
              <ReelCard key={r.id} reel={r} />
            ))}
          </div>
          <div className="reel-set" aria-hidden="true">
            {reels.map((r) => (
              <ReelCard key={r.id} reel={r} hidden />
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
