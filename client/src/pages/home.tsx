import Header from "@/components/header";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import DoctorProfiles from "@/components/doctor-profiles";
import TrustIndicators from "@/components/trust-indicators";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <HowItWorks />
      <DoctorProfiles />
      <TrustIndicators />
      <Footer />
    </div>
  );
}
