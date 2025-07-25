import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { GraduationCap, Calendar, Star, X, Shield, Check, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DoctorProfile, Slot } from "@shared/schema";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  reasonForConsultation: z.string().min(1, "Please describe your consultation reason"),
  slotId: z.number().min(1, "Please select a time slot"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept terms and conditions"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Booking() {
  const { doctorId } = useParams();
  const [, setLocation] = useLocation();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: doctor, isLoading } = useQuery<DoctorProfile>({
    queryKey: [`/api/doctors/${doctorId}`],
  });

  const { data: slots, isLoading: slotsLoading } = useQuery<Slot[]>({
    queryKey: [`/api/doctors/${doctorId}/slots`],
    enabled: !!doctorId,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      reasonForConsultation: "",
      slotId: 0,
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      // Client-side validation
      if (!selectedSlot) {
        toast({
          title: "Please select a time slot",
          description: "Choose your preferred appointment time to continue",
          variant: "destructive",
        });
        return;
      }

      if (!data.acceptTerms) {
        toast({
          title: "Terms acceptance required",
          description: "Please accept our Terms & Conditions to proceed",
          variant: "destructive",
        });
        return;
      }

      const booking = await apiRequest("POST", "/api/bookings", {
        patientName: `${data.firstName} ${data.lastName}`,
        patientEmail: data.email,
        patientPhone: data.phone || null,
        reasonForConsultation: data.reasonForConsultation,
        doctorId: parseInt(doctorId!),
        slotId: selectedSlot,
        appointmentDate: slots?.find(s => s.id === selectedSlot)?.date,
        appointmentTime: slots?.find(s => s.id === selectedSlot)?.time,
      });

      const bookingResponse = await booking.json();
      
      toast({
        title: "Booking created successfully!",
        description: "Redirecting to secure payment...",
      });
      
      // Navigate to checkout with booking details
      setLocation(`/checkout?bookingId=${bookingResponse.id}&doctorId=${doctorId}`);
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  if (isLoading || slotsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor information...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h2>
          <Button onClick={() => setLocation("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Book Consultation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/")}
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <img 
                  src={doctor.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                  alt="Doctor" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Dr. {doctor.specialty}</h4>
                  <p className="text-sm text-gray-600">{doctor.specialty} • {doctor.qualifications}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="text-accent" size={16} />
                    <span className="text-sm text-gray-600">{doctor.rating} ({doctor.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Consultation Fee */}
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-900">Consultation Fee</h5>
                    <p className="text-sm text-gray-600">20-minute video consultation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">£55</p>
                    <p className="text-sm text-gray-600">Secure payment</p>
                  </div>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Time Slots */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Available Times (Next 7 Days)</h5>
                  {!slots || slots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No available slots found</p>
                      <p className="text-sm text-gray-500 mt-1">Please try another doctor or check back later</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slots.map((slot) => {
                        const date = new Date(slot.date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
                        
                        let dateLabel = date.toLocaleDateString('en-GB', { weekday: 'long' });
                        if (isToday) dateLabel = 'Today';
                        else if (isTomorrow) dateLabel = 'Tomorrow';
                        
                        return (
                          <Button
                            key={slot.id}
                            type="button"
                            variant="outline"
                            className={`p-4 text-left justify-start h-auto min-h-[64px] ${
                              selectedSlot === slot.id
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                            }`}
                            onClick={() => {
                              setSelectedSlot(slot.id);
                              form.setValue("slotId", slot.id);
                            }}
                          >
                            <div>
                              <div className="font-medium text-gray-900">{dateLabel}</div>
                              <div className="text-sm text-gray-600">{slot.time}</div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Patient Details */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Your Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName")}
                        placeholder="Enter your first name"
                        className="mt-1"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...form.register("lastName")}
                        placeholder="Enter your last name"
                        className="mt-1"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Enter your email address"
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      placeholder="Enter your phone number"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - for SMS appointment reminders</p>
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="reason">Reason for Consultation *</Label>
                    <Textarea
                      id="reason"
                      {...form.register("reasonForConsultation")}
                      rows={3}
                      placeholder="Briefly describe your health concern..."
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">This helps your doctor prepare for the consultation</p>
                    {form.formState.errors.reasonForConsultation && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.reasonForConsultation.message}</p>
                    )}
                  </div>
                </div>

                {/* Security & Privacy */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="text-trust" size={20} />
                    <h6 className="font-semibold text-gray-900">Your Privacy & Security</h6>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Check className="text-secondary" size={16} />
                      <span>End-to-end encrypted video consultations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="text-secondary" size={16} />
                      <span>GDPR compliant data handling</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="text-secondary" size={16} />
                      <span>Secure payment processing via Stripe</span>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={form.watch("acceptTerms")}
                    onCheckedChange={(checked) => form.setValue("acceptTerms", !!checked)}
                  />
                  <div className="text-sm text-gray-600">
                    <Label htmlFor="acceptTerms" className="cursor-pointer">
                      I agree to the <a href="/terms" className="text-primary hover:underline">Terms & Conditions</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>. I understand that this consultation is for informational purposes and does not replace emergency medical care.
                    </Label>
                  </div>
                </div>
                {form.formState.errors.acceptTerms && (
                  <p className="text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={form.formState.isSubmitting || !selectedSlot || !form.watch("acceptTerms")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {form.formState.isSubmitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <CreditCard size={20} />
                    )}
                    <span>{form.formState.isSubmitting ? 'Creating booking...' : 'Continue to Payment'}</span>
                  </div>
                </Button>

                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="text-2xl text-gray-400">💳</div>
                  <div className="text-2xl text-gray-400">💳</div>
                  <div className="text-2xl text-gray-400">💳</div>
                  <div className="flex items-center space-x-1">
                    <Lock className="text-gray-400" size={16} />
                    <span className="text-xs text-gray-500">Secure Payment</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
