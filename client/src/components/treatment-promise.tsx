import { Button } from "@/components/ui/button";

const conditions = [
  "Endometriosis",
  "PCOS", 
  "Adenomyosis",
  "Hypothyroidism",
  "Polycystic Ovaries",
  "Low/diminished Egg Reserve",
  "Polycystic Ovary Syndrome (PCOS)"
];

export default function TreatmentPromise() {
  return (
    <section className="bg-brown-gradient py-20 text-white">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <h2 className="font-serif text-4xl md:text-6xl font-medium mb-16">
          World-class treatment,{" "}
          <span className="italic">without</span> the wait
        </h2>

        {/* Conditions grid */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-4xl mx-auto">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white border border-white/30"
            >
              <span className="text-sm md:text-base font-medium">{condition}</span>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 max-w-3xl mx-auto">
          <p className="font-serif text-3xl md:text-4xl font-medium mb-6">
            74% of people with symptoms receive a{" "}
            <span className="italic">diagnosis</span> from HerHealth Hub.
          </p>
          <p className="text-white/80 text-lg">
            Don't wait months for answers. Get expert care within 48 hours.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-6">
          <Button 
            size="lg"
            className="bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-300 rounded-2xl px-12 py-6 text-lg font-medium"
          >
            Start 5-min assessment
          </Button>
          <p className="text-white/60 text-sm">
            No waiting lists • Same-day bookings available • GMC registered specialists
          </p>
        </div>
      </div>
    </section>
  );
}