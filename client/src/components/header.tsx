import { Heart, Menu, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
              <Heart className="text-primary-foreground" size={20} />
            </div>
            <h1 className="font-serif font-medium text-2xl text-foreground">HerHealth Hub</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Home
            </Link>
            <Link href="/my-bookings" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              My appointments
            </Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Profile
            </Link>
            <Link href="/dashboard/doctor" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Doctor Dashboard
            </Link>
            <Button 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-2xl px-6 py-3 font-medium"
              asChild
            >
              <Link href="/doctors">Book consultation</Link>
            </Button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/my-bookings" className="hidden sm:block">
              <Calendar className="text-muted-foreground hover:text-foreground transition-colors" size={24} />
            </Link>
            <Link href="/profile" className="hidden sm:block">
              <User className="text-muted-foreground hover:text-foreground transition-colors" size={24} />
            </Link>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="text-muted-foreground" size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
