import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, GraduationCap, Clock, CheckCircle } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface DoctorProfile {
  id: number;
  userId: number;
  specialty: string;
  qualifications: string;
  experience: string;
  bio: string;
  hourlyRate: number;
}

interface DoctorWithRating extends DoctorProfile {
  averageRating?: number;
  totalFeedbacks?: number;
}

export default function Recommendation() {
  const [, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const specialtyParam = urlParams.get('specialty') || '';
  
  // Convert slug back to specialty name
  const specialtyName = specialtyParam
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Fetch doctors with specialty filter
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['/api/doctors', specialtyParam],
    queryFn: async () => {
      const response = await fetch(`/api/doctors?specialty=${encodeURIComponent(specialtyName)}`);
      return response.json();
    }
  });

  // Fetch ratings for each doctor
  const { data: doctorsWithRatings } = useQuery({
    queryKey: ['/api/doctors/ratings', doctors?.map((d: DoctorProfile) => d.id)],
    queryFn: async () => {
      if (!doctors) return [];
      
      const doctorsWithRatings = await Promise.all(
        doctors.map(async (doctor: DoctorProfile) => {
          try {
            const response = await fetch(`/api/doctors/${doctor.id}/rating`);
            const rating = await response.json();
            return { ...doctor, ...rating };
          } catch (error) {
            return { ...doctor, averageRating: 0, totalFeedbacks: 0 };
          }
        })
      );
      
      return doctorsWithRatings;
    },
    enabled: !!doctors
  });

  // Fallback to all doctors if no specialty matches found
  const { data: allDoctors } = useQuery({
    queryKey: ['/api/doctors/all'],
    queryFn: async () => {
      const response = await fetch('/api/doctors');
      return response.json();
    },
    enabled: doctors && doctors.length === 0
  });

  const displayDoctors = doctorsWithRatings || doctors || allDoctors || [];
  const showingFallback = doctors && doctors.length === 0 && allDoctors;

  const handleBookConsultation = (doctorId: number) => {
    setLocation(`/booking/${doctorId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Your Personalized Recommendation
            </h1>
          </div>
          
          {!showingFallback ? (
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Based on your assessment, we recommend a{' '}
              <span className="font-semibold text-white">{specialtyName}</span>
            </p>
          ) : (
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              We couldn't find specialists for "{specialtyName}", so here are our available doctors
            </p>
          )}
        </div>
      </div>

      {/* Doctors Section */}
      <div className="container mx-auto px-4 py-12">
        {displayDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No doctors available at the moment</p>
            <Button onClick={() => setLocation('/')}>
              Return Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayDoctors.map((doctor: DoctorWithRating) => (
              <Card key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {doctor.id === 1 ? 'ER' : doctor.id === 2 ? 'GM' : doctor.id === 3 ? 'SE' : 'OG'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        Dr. {doctor.id === 1 ? 'Emma Repro' : 
                             doctor.id === 2 ? 'Grace Meno' : 
                             doctor.id === 3 ? 'Sarah Endo' : 'Olivia GP'}
                      </h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {doctor.specialty}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-medium text-gray-900">
                      {doctor.averageRating ? doctor.averageRating.toFixed(1) : '4.9'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({doctor.totalFeedbacks || 0} reviews)
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <GraduationCap size={16} />
                      <span>{doctor.qualifications}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{doctor.experience}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {doctor.bio}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      £{doctor.hourlyRate}
                      <span className="text-sm font-normal text-gray-500"> / consultation</span>
                    </div>
                    <Button 
                      onClick={() => handleBookConsultation(doctor.id)}
                      className="bg-primary text-white hover:bg-primary/90 transition-colors min-h-[48px]"
                    >
                      Book Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Book Your Slot</h4>
              <p className="text-sm text-gray-600">Choose a convenient time from available slots</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Secure Payment</h4>
              <p className="text-sm text-gray-600">Pay securely with card - £55 for 20 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Video Consultation</h4>
              <p className="text-sm text-gray-600">Meet your specialist via secure video call</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}