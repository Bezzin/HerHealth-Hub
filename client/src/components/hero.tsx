import { Shield, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Quality Healthcare{" "}
              <span className="text-primary">Within 48 Hours</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Connect with qualified women's health specialists for private consultations. 
              Book appointments, get expert advice, and prioritize your health—all from the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[56px]"
                onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Book Consultation - £55
              </Button>
              <Button 
                variant="outline" 
                className="border border-gray-300 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-h-[56px]"
                onClick={() => document.querySelector('.py-16')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="text-trust" size={20} />
                <span className="text-sm text-gray-600">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="text-trust" size={20} />
                <span className="text-sm text-gray-600">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="text-trust" size={20} />
                <span className="text-sm text-gray-600">Qualified Doctors</span>
              </div>
            </div>

            {/* Assessment CTA */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get personalized care recommendations
                </h3>
                <p className="text-gray-600 mb-4">
                  Take our 4-minute health assessment to match with the right specialist for your needs
                </p>
                <Button 
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors min-h-[48px]"
                  onClick={() => window.location.href = '/intake'}
                >
                  Start 4-min Assessment
                </Button>
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
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
