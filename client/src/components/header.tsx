import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Determine user role
  const userRole = user?.isDoctor ? 'doctor' : (user ? 'patient' : null);

  const renderNavItems = () => {
    // Always show home
    const items = [
      <Link key="home" href="/" className="text-gray-600 hover:text-primary transition-colors">
        Home
      </Link>
    ];

    // Show based on role
    if (userRole === 'patient') {
      items.push(
        <Link key="bookings" href="/my-bookings" className="text-gray-600 hover:text-primary transition-colors">
          My Bookings
        </Link>,
        <Link key="profile" href="/profile" className="text-gray-600 hover:text-primary transition-colors">
          Profile
        </Link>
      );
    } else if (userRole === 'doctor') {
      items.push(
        <Link key="dashboard" href="/dashboard/doctor" className="text-gray-600 hover:text-primary transition-colors">
          Doctor Dashboard
        </Link>
      );
    } else if (userRole === 'admin') {
      items.push(
        <Link key="admin" href="/admin" className="text-gray-600 hover:text-primary transition-colors">
          Admin Panel
        </Link>
      );
    }

    // Show sign in/out based on auth status
    if (!isAuthenticated) {
      items.push(
        <Button 
          key="signin" 
          className="bg-primary text-white hover:bg-primary/90"
          onClick={() => navigate("/login")}
        >
          Sign In
        </Button>
      );
    } else {
      items.push(
        <Button 
          key="signout" 
          variant="outline" 
          className="text-gray-600"
          onClick={() => logout()}
        >
          Sign Out
        </Button>
      );
    }

    return items;
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="text-white text-sm" size={16} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">HerHealth Hub</h1>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              {renderNavItems()}
            </nav>
            
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="text-gray-600" size={24} />
              ) : (
                <Menu className="text-gray-600" size={24} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {renderNavItems().map((item, index) => (
              <div key={index} onClick={() => setIsMenuOpen(false)}>
                {item}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
