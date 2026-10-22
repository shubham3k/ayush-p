"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Embed } from "@/lib/embed";

interface ModalApi {
  open: (em: Embed, vertical: boolean) => void;
}

const ModalContext = createContext<ModalApi | null>(null);

export const useVideoModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useVideoModal must be used inside <VideoModalProvider>");
  return ctx;
};

export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ em: Embed; vertical: boolean } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const open = useCallback((em: Embed, vertical: boolean) => {
    opener.current = document.activeElement as HTMLElement | null;
    setState({ em, vertical });
  }, []);

  const close = useCallback(() => {
    setState(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!state) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, close]);

  const isInstagram = state ? /instagram\.com/.test(state.em.src) : false;

  return (
    <ModalContext.Provider value={{ open }}>
      {children}
      <div
        className={`modal${state ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Video player"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className={`mbox${state?.vertical ? " vert" : ""}`}>
          <button className="x" ref={closeBtn} onClick={close}>
            Close ✕
          </button>
          <div className="frame">
            {state &&
              (state.em.type === "iframe" ? (
                <iframe
                  src={state.em.src}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Video"
                />
              ) : (
                <video src={state.em.src} controls autoPlay playsInline />
              ))}
          </div>
          {state && isInstagram && (
            <a className="alt" style={{ display: "block" }} href={state.em.url} target="_blank" rel="noopener">
              Video not loading? Watch it on Instagram ↗
            </a>
          )}
        </div>
      </div>
    </ModalContext.Provider>
  );
}
