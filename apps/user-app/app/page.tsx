import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import CtaSection from "@/components/cta-section";

export default function HomePage() {
  return (
    <main className="relative bg-[#080810]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
    </main>
  );
}
