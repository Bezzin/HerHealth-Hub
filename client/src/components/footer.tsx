import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={16} />
              </div>
              <h4 className="text-xl font-bold">HerHealth Hub</h4>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering women's health through accessible, professional healthcare consultations.
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Services</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">General Practice</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Women's Health</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mental Health</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dermatology</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Company</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Book Appointment</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Emergency</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 HerHealth Hub. All rights reserved. | Registered in England & Wales
          </p>
        </div>
      </div>
    </footer>
  );
}
