import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="font-serif text-6xl font-medium text-gray-900 mb-4">404</h1>
          <h2 className="font-serif text-2xl font-medium text-gray-900 mb-4">
            Lost? Let's get you back
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Button 
          className="bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-300 rounded-2xl px-8 py-4 text-lg font-medium"
          asChild
        >
          <Link href="/">
            <Home className="mr-2" size={20} />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}