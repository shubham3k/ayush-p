import { NextResponse } from "next/server";
import { CONFIG } from "@/lib/config";

export const runtime = "nodejs";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Receives the contact form and emails it to the portfolio owner through Resend.
 * Needs RESEND_API_KEY (see .env.example); CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL are optional.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Bots fill the hidden field; pretend it worked.
  if (body._honey) return NextResponse.json({ ok: true });

  const name = str(body.name, 100);
  const email = str(body.email, 200);
  const message = str(body.message, 5000);
  const budget = str(body.budget, 80);
  const timeline = str(body.timeline, 80);
  const services = Array.isArray(body.services)
    ? body.services.map((s) => str(s, 80)).filter(Boolean).slice(0, 12)
    : [];

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message || !services.length) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[contact] RESEND_API_KEY is not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const to = process.env.CONTACT_TO_EMAIL || CONFIG.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio enquiries <onboarding@resend.dev>";

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Services", services.join(", ")],
    ["Budget", budget || "—"],
    ["Timeline", timeline || "—"],
    ["Message", message],
  ];

  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
<h2 style="margin:0 0 12px">New project enquiry</h2>
<table style="border-collapse:collapse;width:100%">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e5e5;background:#fafafa;font-weight:600;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 12px;border:1px solid #e5e5e5;white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="color:#777;font-size:13px">Reply to this email to answer ${esc(name)} directly.</p></div>`;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New project enquiry from ${name}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend error", res.status, await res.text());
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Resend request failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
