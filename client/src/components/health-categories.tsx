import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const healthCategories = [
  {
    id: 1,
    title: "Managing symptoms",
    description: "Fatigue, irritability, anxiety, feeling cold, low mood, acne...",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    color: "from-blue-100 to-blue-200"
  },
  {
    id: 2,
    title: "Fertility",
    description: "Planning for the future or actively trying to conceive",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    color: "from-rose-100 to-rose-200"
  },
  {
    id: 3,
    title: "Perimenopause or Menopause",
    description: "Menopausal or experiencing symptoms and looking for answers",
    image: "https://images.unsplash.com/photo-1594824388853-1d56165b4c0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    color: "from-amber-100 to-amber-200"
  }
];

export default function HealthCategories() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground mb-4">
            We're all at different stages of our{" "}
            <span className="italic text-muted-foreground">journey</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What's most important to you?
          </p>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto">
          {healthCategories.map((category) => (
            <div
              key={category.id}
              className="group bg-card rounded-3xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setLocation('/')}
            >
              <div className="relative">
                <div className="aspect-[3/2] relative overflow-hidden">
                  <img 
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`}></div>
                  
                  {/* Plus button */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                      <Plus className="text-foreground" size={24} />
                    </div>
                  </div>
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="font-serif text-2xl md:text-3xl font-medium mb-3">
                      {category.title}
                    </h3>
                    <p className="text-white/90 text-lg leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            size="lg"
            className="rounded-2xl px-8 py-4 text-lg border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-colors"
          >
            Browse all specialists
          </Button>
        </div>
      </div>
    </section>
  );
}