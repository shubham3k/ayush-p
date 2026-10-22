"use client";

import type { CSSProperties } from "react";
import { embed } from "@/lib/embed";
import { useVideoModal } from "./VideoModal";

interface Props {
  title: string;
  meta: string;
  video: string;
  thumb: string;
  vertical: boolean;
  color: string;
}

export default function VideoCard({ title, meta, video, thumb, vertical, color }: Props) {
  const { open } = useVideoModal();
  const em = embed(video);
  const img = thumb || em?.thumb || "";
  const style = { "--c": `var(${color})` } as CSSProperties;

  const inner = (
    <>
      <div className="th">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" alt={title} src={img} />
        )}
        <span className="play" />
      </div>
      <div className="cb">
        <b>{title}</b>
        <small>{meta}</small>
      </div>
    </>
  );

  if (!em)
    return (
      <div className="card off" style={style}>
        {inner}
      </div>
    );

  return (
    <button type="button" className="card" style={style} onClick={() => open(em, vertical)}>
      {inner}
    </button>
  );
}
