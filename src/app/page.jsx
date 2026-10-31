import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { FleetSection } from "@/components/FleetSection";
import { Offers } from "@/components/Offers";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col relative selection:bg-sky-500 selection:text-white">
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <FleetSection />
      <Offers />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}

