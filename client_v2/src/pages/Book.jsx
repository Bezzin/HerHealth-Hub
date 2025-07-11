import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { GraduationCap, Calendar, Star, X, Shield, Check, CreditCard, Lock, Heart, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Navbar, NavbarBrand } from "../components/ui/navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  reasonForConsultation: z.string().min(1, "Please describe your consultation reason"),
  slotId: z.number().min(1, "Please select a time slot"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept terms and conditions"),
});

export default function Book() {
  const { doctorId } = useParams();
  const [, setLocation] = useLocation();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { toast } = useToast();

  const { data: doctor, isLoading } = useQuery({
    queryKey: [`/api/doctors/${doctorId}`],
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: [`/api/doctors/${doctorId}/slots`],
    enabled: !!doctorId,
  });

  const form = useForm({
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

  const onSubmit = async (data) => {
    try {
      if (!selectedSlot) {
        toast({
          title: "Error",
          description: "Please select a time slot",
          variant: "destructive",
        });
        return;
      }

      const booking = await apiRequest("POST", "/api/bookings", {
        patientName: `${data.firstName} ${data.lastName}`,
        patientEmail: data.email,
        patientPhone: data.phone || null,
        reasonForConsultation: data.reasonForConsultation,
        doctorId: parseInt(doctorId),
        slotId: selectedSlot,
        appointmentDate: slots?.find(s => s.id === selectedSlot)?.date,
        appointmentTime: slots?.find(s => s.id === selectedSlot)?.time,
      });

      const bookingResponse = await booking.json();
      
      // Navigate to checkout with booking details
      setLocation(`/checkout?bookingId=${bookingResponse.id}&doctorId=${doctorId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  if (isLoading || slotsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          variant="teal-light"
          logo={
            <NavbarBrand className="text-teal-800">
              <Heart className="h-6 w-6 text-teal-600" />
              HerHealth Hub
            </NavbarBrand>
          }
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          variant="teal-light"
          logo={
            <NavbarBrand className="text-teal-800">
              <Heart className="h-6 w-6 text-teal-600" />
              HerHealth Hub
            </NavbarBrand>
          }
        />
        <div className="flex items-center justify-center py-20">
          <Card variant="elevated">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h2>
              <p className="text-gray-600 mb-6">The doctor you're looking for is not available.</p>
              <Button variant="teal" onClick={() => setLocation("/")}>Return Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const availableSlots = slots?.filter(slot => slot.isAvailable) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        variant="teal-light"
        logo={
          <NavbarBrand className="text-teal-800">
            <Heart className="h-6 w-6 text-teal-600" />
            HerHealth Hub
          </NavbarBrand>
        }
        actions={
          <Button variant="teal-ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Doctor Information Panel */}
            <div className="lg:col-span-1">
              <Card variant="teal-dark" className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">Your Specialist</CardTitle>
                </CardHeader>
                <CardContent className="text-white">
                  <div className="flex items-center space-x-4 mb-6">
                    <img 
                      src={doctor.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                      alt="Doctor" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-white">Dr. {doctor.specialty}</h3>
                      <p className="text-teal-100 text-sm">{doctor.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2">
                      <GraduationCap size={16} className="text-teal-200" />
                      <span className="text-sm text-teal-100">{doctor.qualifications}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star size={16} className="text-yellow-300" />
                      <span className="text-sm text-teal-100">{doctor.rating || "New"} rating</span>
                    </div>
                  </div>

                  <div className="border-t border-teal-500 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-teal-100">Consultation Fee</span>
                      <span className="text-2xl font-bold text-white">£55</span>
                    </div>
                    <p className="text-xs text-teal-200">20-minute video consultation</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Book Your Consultation</CardTitle>
                  <p className="text-gray-600">Fill in your details and select a convenient time slot</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Personal Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="name"
                          {...form.register("firstName")}
                          className="mt-1"
                          placeholder="Enter your first name"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...form.register("lastName")}
                          className="mt-1"
                          placeholder="Enter your last name"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          {...form.register("email")}
                          className="mt-1"
                          placeholder="Enter your email"
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          name="phone"
                          {...form.register("phone")}
                          className="mt-1"
                          placeholder="For appointment reminders"
                        />
                        <p className="text-xs text-gray-500 mt-1">We'll send you SMS reminders if provided</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reason">Reason for Consultation *</Label>
                      <Textarea
                        id="reason"
                        name="reasonForConsultation"
                        {...form.register("reasonForConsultation")}
                        className="mt-1"
                        rows={4}
                        placeholder="Please describe what you'd like to discuss during your consultation..."
                      />
                      {form.formState.errors.reasonForConsultation && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.reasonForConsultation.message}</p>
                      )}
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <Label className="text-base font-semibold">Available Times</Label>
                      <p className="text-sm text-gray-600 mb-4">Choose from available appointments in the next 7 days</p>
                      
                      {availableSlots.length === 0 ? (
                        <Card variant="outlined">
                          <CardContent className="p-4 text-center">
                            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No available slots at the moment.</p>
                            <p className="text-sm text-gray-500">Please check back later or try another doctor.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid gap-3 max-h-64 overflow-y-auto">
                          {availableSlots.map((slot) => (
                            <Card
                              key={slot.id}
                              variant={selectedSlot === slot.id ? "teal" : "default"}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedSlot === slot.id ? "ring-2 ring-teal-500" : ""
                              }`}
                              onClick={() => {
                                setSelectedSlot(slot.id);
                                form.setValue("slotId", slot.id);
                              }}
                              data-testid="slot-button"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {formatDate(slot.date)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {formatTime(slot.time)}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {selectedSlot === slot.id && (
                                      <Check className="w-5 h-5 text-teal-600" />
                                    )}
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Security Notice */}
                    <Card variant="teal">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-teal-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Secure & Confidential</p>
                            <p className="text-sm text-gray-600">
                              All consultations are conducted via secure, encrypted video calls. Your personal health information is protected under GDPR.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Terms Acceptance */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={form.watch("acceptTerms")}
                        onCheckedChange={(checked) => form.setValue("acceptTerms", checked)}
                      />
                      <div>
                        <Label htmlFor="terms" className="text-sm cursor-pointer">
                          I accept the terms and conditions and privacy policy *
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          By booking, you acknowledge that this platform facilitates consultations and doctors are responsible for all clinical decisions.
                        </p>
                        {form.formState.errors.acceptTerms && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.acceptTerms.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center space-x-4 pt-4">
                      <Button
                        type="submit"
                        variant="teal"
                        size="lg"
                        className="flex-1"
                        disabled={!selectedSlot || !form.watch("acceptTerms")}
                        data-testid="proceed-payment-button"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to Payment - £55
                      </Button>
                      <Button
                        type="button"
                        variant="teal-outline"
                        size="lg"
                        onClick={() => setLocation("/")}
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Payment Security Notice */}
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 pt-4 border-t">
                      <div className="flex items-center space-x-1">
                        <Lock className="w-4 h-4" />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span>GDPR Protected</span>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}