import HeroSection from "@/components/HeroSection";
import FeatureBlocks from "@/components/FeatureBlocks"; // Nouveau composant
import PricingPlans from "@/components/PricingPlans";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <main className="bg-grid bg-[#09090b] text-white scroll-smooth">
      <HeroSection />
      <FeatureBlocks />
      <PricingPlans />
      <FinalCTA />
    </main>
  );
}