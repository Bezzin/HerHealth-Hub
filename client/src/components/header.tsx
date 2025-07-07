import { Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="text-white text-sm" size={16} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">HerHealth Hub</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#doctors" className="text-gray-600 hover:text-primary transition-colors">
              Find Doctors
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="#about" className="text-gray-600 hover:text-primary transition-colors">
              About
            </a>
            <Button className="bg-primary text-white hover:bg-primary/90">
              Sign In
            </Button>
          </nav>
          
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="text-gray-600" size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
