import { Search, Calendar, Video } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">How HerHealth Hub Works</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simple, secure, and designed with your busy lifestyle in mind
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-primary" size={24} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">1. Browse Doctors</h4>
            <p className="text-gray-600">
              Search through our verified female doctors, read their profiles, and check availability
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-primary" size={24} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">2. Book Appointment</h4>
            <p className="text-gray-600">
              Choose your preferred time slot and complete secure payment (£55 consultation fee)
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="text-primary" size={24} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">3. Video Consultation</h4>
            <p className="text-gray-600">
              Connect via secure video call from the comfort of your home
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
