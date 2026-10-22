import type { Config } from "@/lib/config";
import ContactForm from "./ContactForm";
import NetworkCanvas from "./NetworkCanvas";
import Reveal from "./Reveal";

export default function Connect({ config }: { config: Config }) {
  return (
    <section className="conn" id="connect">
      <NetworkCanvas />
      <div className="blob c1" aria-hidden="true" />
      <div className="blob c2" aria-hidden="true" />
      <Reveal className="wrap" style={{ position: "relative", zIndex: 2 }}>
        <div className="eyebrow mono">Connect with us</div>
        <h2>Let’s make your next video.</h2>
        <div className="contact">
          <div>
            <p className="lead" style={{ marginBottom: 0 }}>
              {config.connectLead}
            </p>
            <ul className="pts">
              {config.points.map(([title, text]) => (
                <li key={title}>
                  <b>{title}</b>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <ContactForm config={config} />
        </div>
      </Reveal>
    </section>
  );
}
