import type { CSSProperties } from "react";
import type { WorkSection } from "@/lib/config";
import { p2 } from "@/lib/utils";
import Reveal from "./Reveal";
import VideoCard from "./VideoCard";

export default function WorkSections({ work }: { work: WorkSection[] }) {
  return (
    <div>
      {work.map((w) => (
        <Reveal key={w.id} as="section" className="sec" id={w.id}>
          <div className="eyebrow mono">{w.label}</div>
          <h2>{w.title}</h2>
          <p className="lead">{w.lead}</p>
          <div className={`cards ${w.v9 ? "v9" : "h"}`} style={{ "--n": w.n } as CSSProperties}>
            {w.items.map((it, i) => (
              <VideoCard
                key={i}
                title={`${w.label} · ${p2(i + 1)}`}
                meta={w.v9 ? "9:16" : "16:9"}
                video={it.video}
                thumb={it.thumb}
                vertical={!!w.v9}
                color={w.c}
              />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
