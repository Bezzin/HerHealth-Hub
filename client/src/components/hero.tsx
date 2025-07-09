import { Button } from "@/components/ui/button";
import { Clock, Star, Video } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-warm-gradient min-h-screen flex flex-col justify-center py-12 mt-3">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main headline */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium text-gray-900 mb-6 leading-tight">
            Women-centred care,{" "}
            <span className="italic text-gray-700">without the wait.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Connect with qualified women's health specialists for private video consultations. 
            Expert advice when you need it most.
          </p>
        </div>

        {/* Featured consultation card */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                Most popular
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock size={16} />
                <span className="text-sm">20 min</span>
              </div>
            </div>
            
            <div className="relative mb-6">
              <div className="aspect-video bg-warm-card rounded-2xl flex items-center justify-center relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Women's health specialist consultation" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                  <Video className="text-primary" size={20} />
                </div>
              </div>
            </div>

            <h3 className="font-serif text-2xl font-medium text-foreground mb-3">
              Women's Health Specialist Consultation
            </h3>
            <p className="text-muted-foreground mb-6">
              Get expert advice on gynecology, fertility, menopause, and general women's health concerns from qualified specialists.
            </p>

            <Button 
              className="w-full bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-300 rounded-2xl py-6 text-lg font-medium"
              size="lg"
            >
              Book consultation - £55
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Trusted by thousands of women across the UK</p>
          <div className="flex items-center justify-center space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Star className="fill-yellow-400 text-yellow-400" size={16} />
              <span className="text-sm">4.9/5 rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">GDPR compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">GMC registered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
