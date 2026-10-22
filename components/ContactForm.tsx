"use client";

import { useState, type FormEvent } from "react";
import type { Config } from "@/lib/config";

type Status = "idle" | "sending" | "sent";

export default function ContactForm({ config }: { config: Config }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<React.ReactNode>("");

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const services = fd.getAll("services").map(String);

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message || !services.length) {
      setError("Please add your name, a valid email, at least one service and a short message.");
      return;
    }
    if (fd.get("_honey")) return; // bot trap
    setError("");
    setStatus("sending");

    try {
      const r = await fetch(config.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          services: services.join(", "),
          budget: fd.get("budget"),
          timeline: fd.get("timeline"),
          message,
          _subject: `New project enquiry from ${name}`,
          _replyto: email,
          _template: "table",
          _captcha: "false",
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError(
        <>
          Couldn’t send right now. Please email me directly at <a href={`mailto:${config.email}`}>{config.email}</a>.
        </>,
      );
    }
  }

  return (
    <div className="formbox">
      {status === "sent" ? (
        <div className="ok" style={{ display: "block" }}>
          <b>Got it — thank you!</b>
          <span style={{ color: "var(--mute)" }}>Your enquiry has been sent. I’ll reply soon.</span>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <input className="hp" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="two">
            <div>
              <label htmlFor="f-name">Name</label>
              <input id="f-name" name="name" autoComplete="name" required />
            </div>
            <div>
              <label htmlFor="f-email">Email</label>
              <input id="f-email" name="email" type="email" autoComplete="email" required />
            </div>
          </div>
          <label>What do you need from us?</label>
          <div className="opts">
            {config.services.map((s, i) => (
              <label key={s}>
                <input type="checkbox" name="services" value={s} defaultChecked={i === 0} />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <div className="two">
            <div>
              <label htmlFor="f-budget">Budget</label>
              <select id="f-budget" name="budget">
                {config.budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-time">Timeline</label>
              <select id="f-time" name="timeline">
                {config.timelines.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <label htmlFor="f-msg">Tell me about your project</label>
          <textarea
            id="f-msg"
            name="message"
            placeholder="Links to raw footage, references, what the video is for…"
            required
          />
          <div className="err" role="alert">
            {error}
          </div>
          <button className="send" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      )}
    </div>
  );
}
