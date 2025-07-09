import { Shield, Star, Users, UserCheck } from "lucide-react";

export default function TrustIndicators() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground mb-8">
            Why choose{" "}
            <span className="italic text-muted-foreground">HerHealth Hub?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-foreground" size={24} />
            </div>
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">GDPR Compliant</h3>
            <p className="text-muted-foreground text-sm">Your data is protected with the highest security standards</p>
          </div>

          <div className="text-center">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="text-yellow-500 fill-yellow-500" size={24} />
            </div>
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">4.9/5 Rating</h3>
            <p className="text-muted-foreground text-sm">Thousands of satisfied patients across the UK</p>
          </div>

          <div className="text-center">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="text-foreground" size={24} />
            </div>
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">10,000+ Consultations</h3>
            <p className="text-muted-foreground text-sm">Trusted platform with proven track record</p>
          </div>

          <div className="text-center">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="text-foreground" size={24} />
            </div>
            <h3 className="font-serif text-xl font-medium text-foreground mb-2">GMC Registered</h3>
            <p className="text-muted-foreground text-sm">All specialists are fully qualified and registered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
