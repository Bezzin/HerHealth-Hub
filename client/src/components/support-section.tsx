import { Button } from "@/components/ui/button";
import { Video, Clock, FileText, Stethoscope } from "lucide-react";

const supportFeatures = [
  {
    icon: Clock,
    title: "Receive clinical-grade results within 6 days of testing",
    description: "Fast, accurate results you can trust"
  },
  {
    icon: FileText,
    title: "Get insights into your health status",
    description: "Comprehensive reports with clear explanations"
  },
  {
    icon: Stethoscope,
    title: "Find answers to your symptoms",
    description: "Expert analysis of irregular periods, acne, or other concerns"
  },
  {
    icon: Video,
    title: "Receive a doctor-written report with a clinical Care Plan",
    description: "Personalized treatment recommendations"
  }
];

export default function SupportSection() {
  return (
    <section className="bg-brown-gradient py-20 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Emotional messaging */}
        <div className="text-center mb-16">
          <div className="space-y-4 mb-12">
            <p className="font-serif text-2xl md:text-3xl italic opacity-80 line-through">
              I feel dismissed
            </p>
            <p className="font-serif text-2xl md:text-3xl italic opacity-80 line-through">
              I am just a number
            </p>
            <p className="font-serif text-2xl md:text-3xl italic opacity-80 line-through">
              I don't feel heard
            </p>
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl font-medium mb-8">
            We're here to support you
          </h2>
        </div>

        {/* Video consultation card */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-foreground">
            <div className="aspect-video bg-warm-card rounded-2xl mb-6 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Video consultation with specialist" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4">
                  <Video className="text-primary" size={32} />
                </div>
              </div>
            </div>
            
            <h3 className="font-serif text-2xl font-medium mb-4">
              Expert support included with a Clinical Result Review Call
            </h3>
            <p className="text-muted-foreground mb-6">
              20-minute video consultation with a qualified women's health specialist
            </p>
          </div>
        </div>

        {/* Support features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {supportFeatures.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <feature.icon className="text-white mb-4" size={32} />
              <h3 className="font-serif text-xl font-medium mb-3">
                {feature.title}
              </h3>
              <p className="text-white/80">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-300 rounded-2xl px-12 py-6 text-lg font-medium"
          >
            Start 5-min assessment
          </Button>
        </div>
      </div>
    </section>
  );
}