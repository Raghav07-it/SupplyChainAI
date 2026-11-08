import LandingNav from "../components/landing/LandingNav";
import HeroSection from "../components/landing/HeroSection";
import ProductShowcase from "../components/landing/ProductShowcase";
import CapabilitiesSection from "../components/landing/CapabilitiesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import TechnologySection from "../components/landing/TechnologySection";
import DifferentiatorsSection from "../components/landing/DifferentiatorsSection";
import FinalCtaSection from "../components/landing/FinalCtaSection";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
  const handleExploreClick = () => {
    const el = document.getElementById("product-overview");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] text-[var(--text-body)] font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Top Navbar */}
      <LandingNav />

      {/* Main Content Sections */}
      <main>
        <HeroSection onExploreClick={handleExploreClick} />
        <ProductShowcase />
        <CapabilitiesSection />
        <HowItWorksSection />
        <TechnologySection />
        <DifferentiatorsSection />
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
