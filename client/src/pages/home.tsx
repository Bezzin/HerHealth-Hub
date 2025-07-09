import Header from "@/components/header";
import Hero from "@/components/hero";
import HealthCategories from "@/components/health-categories";
import SupportSection from "@/components/support-section";
import TreatmentPromise from "@/components/treatment-promise";
import TrustIndicators from "@/components/trust-indicators";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <HealthCategories />
      <SupportSection />
      <TreatmentPromise />
      <TrustIndicators />
      <Footer />
    </div>
  );
}
