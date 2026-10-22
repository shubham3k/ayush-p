import type { CSSProperties } from "react";
import type { Testimonial } from "@/lib/config";
import Reveal from "./Reveal";
import VideoCard from "./VideoCard";

export default function Testimonials({ lead, items }: { lead: string; items: Testimonial[] }) {
  return (
    <Reveal as="section" className="sec" id="testimonials">
      <div className="eyebrow mono">Video testimonials</div>
      <h2>Clients, in their own words.</h2>
      <p className="lead">{lead}</p>
      <div className="cards v9" style={{ "--n": 5 } as CSSProperties}>
        {items.map((x, i) => (
          <VideoCard
            key={i}
            title={x.name}
            meta={x.role}
            video={x.video}
            thumb={x.poster}
            vertical
            color="--accent"
          />
        ))}
      </div>
    </Reveal>
  );
}
