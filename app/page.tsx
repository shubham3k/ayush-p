import { CONFIG } from "@/lib/config";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import VideoStrip from "@/components/VideoStrip";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import Stats from "@/components/Stats";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";
import { VideoModalProvider } from "@/components/VideoModal";

export default function Home() {
  return (
    <VideoModalProvider>
      <Cursor />
      <Hero config={CONFIG} />
      <div className="wrap">
        <About config={CONFIG} />
        <Timeline config={CONFIG} />
        <Stats stats={CONFIG.stats} />
        {CONFIG.strips.map((s) => (
          <VideoStrip key={s.id} section={s} />
        ))}
      </div>
      <Connect config={CONFIG} />
      <Footer email={CONFIG.email} />
    </VideoModalProvider>
  );
}
