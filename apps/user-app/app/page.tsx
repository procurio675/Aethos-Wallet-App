import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import CtaSection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#080810]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
