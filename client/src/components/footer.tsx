import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-background rounded-2xl flex items-center justify-center">
                <Heart className="text-foreground" size={20} />
              </div>
              <span className="font-serif font-medium text-2xl">HerHealth Hub</span>
            </div>
            <p className="text-background/80 text-lg mb-6 max-w-md">
              Expert women's health consultations delivered with care and precision. 
              Bridging the gap between you and specialist healthcare.
            </p>
            <p className="text-background/60 text-sm">
              GMC registered specialists • GDPR compliant • Secure payments
            </p>
          </div>
          
          <div>
            <h3 className="font-serif font-medium text-xl mb-6">Services</h3>
            <ul className="space-y-4 text-background/80">
              <li><Link href="/doctors" className="hover:text-background transition-colors">Find specialists</Link></li>
              <li><Link href="/" className="hover:text-background transition-colors">Book consultation</Link></li>
              <li><Link href="/my-bookings" className="hover:text-background transition-colors">My appointments</Link></li>
              <li><Link href="/profile" className="hover:text-background transition-colors">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif font-medium text-xl mb-6">Support</h3>
            <ul className="space-y-4 text-background/80">
              <li><Link href="/terms" className="hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><a href="mailto:support@herhealthhub.co.uk" className="hover:text-background transition-colors">Contact Support</a></li>
              <li><a href="tel:+441234567890" className="hover:text-background transition-colors">Emergency: 111</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-background/60 text-sm">
              © 2025 HerHealth Hub Ltd. Company No. 12345678. All rights reserved.
            </p>
            <div className="flex space-x-6 text-background/60 text-sm">
              <span>England & Wales jurisdiction</span>
              <span>Professional indemnity insured</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
