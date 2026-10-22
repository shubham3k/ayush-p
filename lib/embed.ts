export interface Embed {
  type: "iframe" | "video";
  src: string;
  thumb?: string;
  url: string;
}

export function embed(u: string): Embed | null {
  if (!u) return null;
  let m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (m)
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`,
      thumb: `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`,
      url: u,
    };
  m = u.match(/vimeo\.com\/(\d+)/);
  if (m) return { type: "iframe", src: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, url: u };
  m = u.match(/instagram\.com\/(?:reel|reels|p)\/([\w-]+)/);
  if (m) return { type: "iframe", src: `https://www.instagram.com/reel/${m[1]}/embed`, url: u };
  m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (m) return { type: "iframe", src: `https://drive.google.com/file/d/${m[1]}/preview`, url: u };
  return { type: "video", src: u, url: u };
}
