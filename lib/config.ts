export type ClipKind = "v" | "g" | "adj" | "au" | "sf";

export interface Clip {
  t: number;
  s: number;
  l: number;
  k: ClipKind;
  label: string;
  c: string;
  link?: string;
}

export type StripVariant = "tall" | "wide";

export interface StripItem {
  id: string;
  loop: string;
  full: string;
  poster: string;
  title: string;
  caption?: string;
}

export interface StripSection {
  id: string;
  label: string;
  title: string;
  lead: string;
  variant: StripVariant;
  items: StripItem[];
}

/** Builds items for files named <prefix>-01 ... in public/<dir> (see portfolio-assets/compress.sh). */
const strip = (
  dir: string,
  prefix: string,
  n: number,
  title: (i: number) => string,
  caption?: (i: number) => string,
): StripItem[] =>
  Array.from({ length: n }, (_, k) => {
    const id = `${prefix}-${String(k + 1).padStart(2, "0")}`;
    return {
      id,
      loop: `/${dir}/${id}-loop.mp4`,
      full: `/${dir}/${id}.mp4`,
      poster: `/${dir}/${id}.jpg`,
      title: title(k),
      caption: caption?.(k),
    };
  });

export const CONFIG = {
  name: "Ayush Raj Gupta",
  email: "ayushrajgupta231@gmail.com",
  headlineA: "Video editing is",
  headlineB: "storytelling, one cut at a time.",
  tagline: "I shape raw footage into videos that look sharp, sound right and keep people watching.",
  photo: "/ayush.jpg",
  aboutTitle: "Hi, I’m Ayush Raj Gupta.",
  about: [
    "I’m a <b>video editor with 3.5 years of experience</b>, and my edits have generated <b>6+ million views</b>.",
    "I’ve cut short-form reels, SaaS product demos, product ads and long-form YouTube videos — handling the whole flow: editing, color grading, sound design, motion graphics and the shoot itself.",
  ],
  tags: [
    "Short-form",
    "SaaS videos",
    "Product ads",
    "YouTube",
    "Color grading",
    "Sound design",
    "Motion graphics",
    "Content shoot",
  ],
  project: "Portfolio_2026.prproj",
  stats: [
    ["3.5+", "Years of experience"],
    ["6M+", "Views generated"],
    ["6+", "Content formats"],
  ] as [string, string][],

  /* Contact form → POST /api/contact (app/api/contact/route.ts), which emails `email` above via Resend. */
  budgets: ["Under ₹10k", "₹10k – ₹25k", "₹25k – ₹60k", "₹60k+", "Not sure yet"],
  timelines: ["ASAP (this week)", "Within 2 weeks", "This month", "Flexible"],
  services: [
    "Video editing",
    "Content shoot",
    "Short-form / Reels",
    "SaaS & product videos",
    "YouTube long-form",
    "Color grading",
    "Full content package",
  ],
  connectLead:
    "Tell me what you need — editing, a content shoot, or a full content package. You’ll hear back soon.",
  points: [
    ["Video editing", "Short-form, SaaS, product and YouTube videos."],
    ["Content shoot", "Planning and shooting your content end to end."],
    ["Color · sound · motion", "Grade, SFX, music and motion graphics included."],
  ] as [string, string][],

  /* ---------- hero timeline ---------- */
  duration: 60,
  tracks: [
    { n: "V4", d: "Titles" },
    { n: "V3", d: "Graphics" },
    { n: "V2", d: "B-roll" },
    { n: "V1", d: "Main cut" },
    { n: "ADJ", d: "Color" },
    { n: "A1", d: "Dialogue" },
    { n: "A2", d: "Music" },
    { n: "A3", d: "SFX" },
  ],
  /* t=track index, s=start sec, l=length sec, k: v video | g graphic | adj | au audio | sf sfx, link=section id */
  clips: [
    { t: 0, s: 3, l: 9, k: "g", label: "Title · Lower third", c: "--a3", link: "work-youtube" },
    { t: 0, s: 26, l: 8, k: "g", label: "Kinetic text", c: "--a3", link: "work-short" },
    { t: 0, s: 44, l: 11, k: "g", label: "CTA end card", c: "--a3", link: "connect" },
    { t: 1, s: 0, l: 14, k: "g", label: "Motion graphics", c: "--a2", link: "work-youtube" },
    { t: 1, s: 20, l: 12, k: "g", label: "UI callouts", c: "--a2", link: "work-youtube" },
    { t: 1, s: 38, l: 14, k: "g", label: "Subtitles", c: "--a4", link: "work-short" },
    { t: 2, s: 5, l: 15, k: "v", label: "B-roll · product", c: "--a2", link: "work-product" },
    { t: 2, s: 24, l: 12, k: "v", label: "Screen capture", c: "--a3", link: "work-youtube" },
    { t: 2, s: 40, l: 16, k: "v", label: "B-roll · lifestyle", c: "--a4", link: "work-product" },
    { t: 3, s: 0, l: 19, k: "v", label: "Interview A-cam", c: "--accent", link: "work-youtube" },
    { t: 3, s: 19, l: 17, k: "v", label: "Reel · vertical cut", c: "--accent", link: "work-short" },
    { t: 3, s: 36, l: 24, k: "v", label: "Product hero shot", c: "--accent", link: "work-product" },
    { t: 4, s: 0, l: 60, k: "adj", label: "Adjustment layer · Color grade", c: "--a4", link: "work-product" },
    { t: 5, s: 0, l: 36, k: "au", label: "Dialogue · cleaned", c: "--accent", link: "work-youtube" },
    { t: 5, s: 38, l: 20, k: "au", label: "Voiceover", c: "--accent", link: "work-youtube" },
    { t: 6, s: 0, l: 60, k: "au", label: "Music bed · ducked", c: "--a2", link: "work-short" },
    { t: 7, s: 3, l: 3, k: "sf", label: "whoosh", c: "--a3" },
    { t: 7, s: 11, l: 3, k: "sf", label: "hit", c: "--a4" },
    { t: 7, s: 19, l: 4, k: "sf", label: "swipe", c: "--a2" },
    { t: 7, s: 27, l: 3, k: "sf", label: "pop", c: "--a3" },
    { t: 7, s: 36, l: 4, k: "sf", label: "whoosh", c: "--a3" },
    { t: 7, s: 44, l: 3, k: "sf", label: "click", c: "--a4" },
    { t: 7, s: 52, l: 5, k: "sf", label: "riser", c: "--a2" },
  ] as Clip[],
  palette: ["#1d2b3a", "#c9733d", "#e9d8b5", "#5eead4", "#f472b6", "#9999ff"],
  transitions: [19, 36],

  /* ---------- work sections: live, right-to-left scrolling video strips ----------
     Each strip plays muted loops (<id>-loop.mp4) and opens the full video (<id>.mp4) on click.
     Files: public/reels (short-form) and public/work (everything else).
     Previous short-form Instagram links: Dc-uXm_I_8_, DafvGWEpuZ8, DV-9c2AE_lD, DY1-aHxzM4I,
     DZumfjTJ3wd, Dd_dSV1Bjv4, DePKO45JCjx, DdLIZXgDo1T (spare: DdDdK1bDi8u) */
  strips: [
    {
      id: "work-short",
      label: "Short-form",
      title: "Short-form content",
      lead: "Reels, Shorts and TikToks cut for retention: hooks, captions, pacing and sound.",
      variant: "tall",
      items: strip("reels", "reel", 9, (i) => `Reel ${String(i + 1).padStart(2, "0")}`),
    },
    {
      id: "work-youtube",
      label: "YouTube & SaaS",
      title: "YouTube & SaaS videos",
      lead: "Long-form and product edits with story structure, clean UI motion, graphics and sound design.",
      variant: "wide",
      items: strip("work", "youtube-saas", 4, (i) => `YouTube & SaaS ${String(i + 1).padStart(2, "0")}`),
    },
    {
      id: "work-product",
      label: "Product",
      title: "Product-based content",
      lead: "Ads and showcase videos for products: cinematic B-roll, grade and sound — in 9:16.",
      variant: "tall",
      items: strip("work", "product", 5, (i) => `Product ${String(i + 1).padStart(2, "0")}`),
    },
    {
      id: "testimonials",
      label: "Video testimonials",
      title: "Clients, in their own words.",
      lead: "Short video reviews from clients I’ve edited for.",
      variant: "tall",
      // Replace the names/roles below with the real clients (the order matches testimonial-01..04).
      items: strip(
        "work",
        "testimonial",
        4,
        (i) => ["Client name", "Client name", "Client name", "Shashwat"][i],
        () => "Brand / company",
      ),
    },
  ] as StripSection[],
};

export type Config = typeof CONFIG;
