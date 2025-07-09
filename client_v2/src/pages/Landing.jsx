import { useQuery } from "@tanstack/react-query";
import { Shield, Lock, UserCheck, Calendar, Star, GraduationCap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar, NavbarBrand } from "@/components/ui/navbar";
import { useLocation } from "wouter";

// Hero Section Component
function Hero() {
  const [, setLocation] = useLocation();

  return (
    <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Get expert women's health advice{" "}
              <span className="text-teal-600">within 48 hours</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with qualified women's health specialists for private consultations. 
              Book appointments, get expert advice, and prioritize your health—all from the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                variant="teal" 
                size="lg"
                onClick={() => setLocation("#doctors")}
                className="px-8 py-4 text-base font-semibold"
                data-testid="book-consultation-button"
              >
                Book Consultation - £55
              </Button>
              <Button 
                variant="teal-outline" 
                size="lg"
                className="px-8 py-4 text-base font-semibold"
              >
                Learn More
              </Button>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="text-teal-600" size={20} />
                <span className="text-sm text-gray-600">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="text-teal-600" size={20} />
                <span className="text-sm text-gray-600">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="text-teal-600" size={20} />
                <span className="text-sm text-gray-600">Qualified Doctors</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Professional female doctor" 
              className="rounded-2xl shadow-xl w-full h-auto"
            />
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-teal-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Choose Your Specialist",
      description: "Browse our qualified women's health specialists and select the right doctor for your needs.",
      icon: <UserCheck className="w-8 h-8 text-teal-600" />
    },
    {
      step: 2,
      title: "Book Your Slot",
      description: "Select an available time slot that works for your schedule. Appointments available within 48 hours.",
      icon: <Calendar className="w-8 h-8 text-teal-600" />
    },
    {
      step: 3,
      title: "Secure Video Call",
      description: "Join your 20-minute private consultation from the comfort of your home via secure video call.",
      icon: <Shield className="w-8 h-8 text-teal-600" />
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Getting quality healthcare has never been easier. Follow these simple steps to connect with a specialist.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.step} variant="teal" className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {step.icon}
                </div>
                <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Doctor Profiles Section with enhanced UI
function DoctorProfiles() {
  const [, setLocation] = useLocation();
  
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["/api/doctors"],
  });

  // Fetch ratings for all doctors
  const { data: doctorsWithRatings, isLoading: isLoadingRatings } = useQuery({
    queryKey: ["/api/doctors", "with-ratings"],
    queryFn: async () => {
      if (!doctors) return [];
      
      const doctorsWithRatings = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const response = await fetch(`/api/doctors/${doctor.id}/rating`);
            const rating = await response.json();
            return { ...doctor, ...rating };
          } catch (error) {
            console.error(`Error fetching rating for doctor ${doctor.id}:`, error);
            return { ...doctor, averageRating: 0, totalFeedbacks: 0 };
          }
        })
      );
      return doctorsWithRatings;
    },
    enabled: !!doctors,
  });

  if (isLoading || isLoadingRatings) {
    return (
      <section id="doctors" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Doctors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experienced healthcare professionals dedicated to women's health
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="doctors" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Doctors</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experienced healthcare professionals dedicated to women's health
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctorsWithRatings?.map((doctor) => (
            <Card key={doctor.id} variant="elevated" className="hover:shadow-lg transition-shadow" data-testid="doctor-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={doctor.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                    alt={`Dr. ${doctor.specialty}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900" data-testid="doctor-name">Dr. {doctor.specialty}</h3>
                    <p className="text-sm text-gray-600" data-testid="doctor-specialty">{doctor.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-medium" data-testid="doctor-rating">
                      {doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : "New"}
                    </span>
                    <span className="text-sm text-gray-500" data-testid="total-feedbacks">
                      ({doctor.totalFeedbacks} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <GraduationCap size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600" data-testid="doctor-qualifications">{doctor.qualifications}</span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3" data-testid="doctor-experience">
                  {doctor.bio || `${doctor.yearsOfExperience} years of experience in ${doctor.specialty}.`}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Available today</span>
                  </div>
                  <span className="text-lg font-bold text-teal-600">£55</span>
                </div>

                <Button 
                  variant="teal" 
                  className="w-full"
                  onClick={() => setLocation(`/booking/${doctor.id}`)}
                  data-testid="book-now-button"
                >
                  Book Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Trust Indicators Section
function TrustIndicators() {
  const indicators = [
    {
      icon: <Shield className="w-12 h-12 text-teal-600" />,
      title: "GDPR Compliant",
      description: "Your data is protected with the highest security standards"
    },
    {
      icon: <Lock className="w-12 h-12 text-teal-600" />,
      title: "Secure Payments",
      description: "All transactions are encrypted and processed securely"
    },
    {
      icon: <UserCheck className="w-12 h-12 text-teal-600" />,
      title: "Qualified Doctors",
      description: "All doctors are registered and verified healthcare professionals"
    },
    {
      icon: <Heart className="w-12 h-12 text-teal-600" />,
      title: "24/7 Support",
      description: "Our support team is available to help you anytime"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose HerHealth?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your health and privacy are our top priorities. We're committed to providing secure, professional healthcare.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {indicators.map((indicator, index) => (
            <Card key={index} variant="teal" className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {indicator.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{indicator.title}</h3>
                <p className="text-sm text-gray-600">{indicator.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-teal-400" />
              <span className="text-xl font-bold">HerHealth</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting women with qualified healthcare specialists for private consultations.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Video Consultations</li>
              <li>Women's Health</li>
              <li>Gynecology</li>
              <li>Fertility Advice</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Technical Support</li>
              <li>Emergency Services</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button 
                  onClick={() => setLocation("/terms")}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation("/privacy")}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>GDPR Compliance</li>
              <li>Data Protection</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 HerHealth Hub. Trading as Sunscapes Media Ltd. All rights reserved.</p>
          <p className="mt-2">Registered in England & Wales. This platform facilitates consultations - doctors are responsible for all clinical decisions.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar
        variant="teal-light"
        logo={
          <NavbarBrand className="text-teal-800">
            <Heart className="h-6 w-6 text-teal-600" />
            HerHealth Hub
          </NavbarBrand>
        }
        links={[
          { label: 'Home', href: '#', active: true },
          { label: 'Doctors', href: '#doctors' },
          { label: 'How It Works', href: '#how-it-works' },
          { label: 'Support', href: '#support' },
        ]}
        actions={
          <>
            <Button variant="teal-ghost">Sign In</Button>
            <Button variant="teal">Book Now</Button>
          </>
        }
      />
      
      <Hero />
      <HowItWorks />
      <DoctorProfiles />
      <TrustIndicators />
      <Footer />
    </div>
  );
}