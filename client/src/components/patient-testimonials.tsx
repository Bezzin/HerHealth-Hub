import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  age: string;
  condition: string;
  rating: number;
  text: string;
  date: string;
}

export default function PatientTestimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah M.",
      age: "32",
      condition: "PCOS Management",
      rating: 5,
      text: "After months on the NHS waiting list, I found HerHealth Hub. Within 48 hours, I had a consultation with a specialist who truly understood PCOS. She adjusted my treatment plan, and I'm finally seeing results.",
      date: "2 weeks ago"
    },
    {
      id: 2,
      name: "Emma R.",
      age: "45",
      condition: "Menopause Support",
      rating: 5,
      text: "The convenience of speaking to a menopause specialist from home was life-changing. My doctor was knowledgeable, compassionate, and gave me practical advice that my GP hadn't mentioned.",
      date: "1 month ago"
    },
    {
      id: 3,
      name: "Jessica L.",
      age: "28",
      condition: "Fertility Consultation",
      rating: 5,
      text: "I was anxious about starting my fertility journey. The specialist I spoke with was incredible - she explained everything clearly and helped me understand my options. Worth every penny.",
      date: "3 weeks ago"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Patients Say</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real stories from women who've transformed their health journey with HerHealth Hub
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-teal-200" />
                </div>
                
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.condition}</p>
                    </div>
                    <p className="text-sm text-gray-500">{testimonial.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-white px-6 py-3 rounded-full shadow-md">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/40?img=${i}`}
                  alt="Patient"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-gray-700">
              Join 4,000+ women who've taken control of their health
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}