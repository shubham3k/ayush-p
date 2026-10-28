import { CONFIG } from "@/lib/config";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import ReelMarquee from "@/components/ReelMarquee";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import Stats from "@/components/Stats";
import WorkSections from "@/components/WorkSections";
import Testimonials from "@/components/Testimonials";
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
        <ReelMarquee config={CONFIG} />
        <WorkSections work={CONFIG.work} />
        <Testimonials lead={CONFIG.testimonialsLead} items={CONFIG.testimonials} />
      </div>
      <Connect config={CONFIG} />
      <Footer email={CONFIG.email} />
    </VideoModalProvider>
  );
}
