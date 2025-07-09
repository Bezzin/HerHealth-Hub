import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { DoctorProfile } from "@shared/schema";

interface DoctorWithRating extends DoctorProfile {
  averageRating?: number;
  totalFeedbacks?: number;
}

export default function DoctorProfiles() {
  const [, setLocation] = useLocation();
  
  const { data: doctors, isLoading } = useQuery<DoctorProfile[]>({
    queryKey: ["/api/doctors"],
  });

  // Fetch ratings for all doctors
  const { data: doctorsWithRatings, isLoading: isLoadingRatings } = useQuery<DoctorWithRating[]>({
    queryKey: ["/api/doctors", "with-ratings"],
    queryFn: async () => {
      if (!doctors) return [];
      
      const doctorsWithRatings = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const response = await fetch(`/api/doctors/${doctor.id}/rating`);
            const rating = await response.json();
            return { ...doctor, ...rating };
          } catch (error) {
            console.error(`Error fetching rating for doctor ${doctor.id}:`, error);
            return { ...doctor, averageRating: 0, totalFeedbacks: 0 };
          }
        })
      );
      return doctorsWithRatings;
    },
    enabled: !!doctors,
  });

  if (isLoading || isLoadingRatings) {
    return (
      <section id="doctors" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Doctors</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experienced healthcare professionals dedicated to women's health
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="doctors" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Doctors</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experienced healthcare professionals dedicated to women's health
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctorsWithRatings?.map((doctor) => (
            <Card key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={doctor.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                    alt={`Dr. ${doctor.specialty}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Dr. {doctor.specialty}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="text-trust" size={16} />
                    <span className="text-sm text-gray-600">{doctor.qualifications}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-trust" size={16} />
                    <span className="text-sm text-gray-600">{doctor.experience}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="text-sm text-gray-600">
                      {doctor.averageRating && doctor.averageRating > 0 
                        ? `${doctor.averageRating} (${doctor.totalFeedbacks} review${doctor.totalFeedbacks !== 1 ? 's' : ''})`
                        : 'No reviews yet'
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Available within 48h</span>
                  </div>
                  <Button 
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    onClick={() => setLocation(`/booking/${doctor.id}`)}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
