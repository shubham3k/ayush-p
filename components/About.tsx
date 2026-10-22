import Image from "next/image";
import type { Config } from "@/lib/config";
import Reveal from "./Reveal";

export default function About({ config }: { config: Config }) {
  return (
    <Reveal as="section" className="about" id="about">
      <div>
        <div className="eyebrow mono">About me</div>
        <h2>{config.aboutTitle}</h2>
        <div>
          {config.about.map((p, i) => (
            // Trusted, author-written markup from lib/config.ts (supports <b>).
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
        <div className="tags">
          {config.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      <div className="photo">
        <div className="pf">
          <i />
          <i />
          <i />
          <i />
          {config.photo ? (
            <Image src={config.photo} alt={config.name} fill sizes="(max-width: 900px) 100vw, 380px" priority />
          ) : (
            <span>
              Your photo here
              <br />
              <small>(add it in lib/config.ts → photo)</small>
            </span>
          )}
        </div>
      </div>
    </Reveal>
  );
}
