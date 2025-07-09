import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const feedbackSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface BookingDetails {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorId: number;
  patientId: number;
  status: string;
}

interface DoctorProfile {
  id: number;
  specialty: string;
  qualifications: string;
  experience: string;
  bio: string;
  profileImage: string;
}

export default function Feedback() {
  const { bookingId } = useParams();
  const [, setLocation] = useLocation();
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      isAnonymous: false,
    },
  });

  const watchedRating = form.watch("rating");

  // Fetch booking details
  const { data: booking, isLoading: isLoadingBooking } = useQuery<BookingDetails>({
    queryKey: ['/api/bookings', bookingId],
    enabled: !!bookingId,
  });

  // Fetch doctor details
  const { data: doctor, isLoading: isLoadingDoctor } = useQuery<DoctorProfile>({
    queryKey: ['/api/doctors', booking?.doctorId],
    enabled: !!booking?.doctorId,
  });

  // Check if feedback already exists
  const { data: existingFeedback } = useQuery({
    queryKey: ['/api/feedback/booking', bookingId],
    enabled: !!bookingId,
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      if (!booking) throw new Error("Booking not found");
      
      const response = await apiRequest("POST", "/api/feedback", {
        bookingId: parseInt(bookingId!),
        doctorId: booking.doctorId,
        patientId: booking.patientId,
        rating: data.rating,
        comment: data.comment || null,
        isAnonymous: data.isAnonymous,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your feedback!",
        description: "Your review helps other patients make informed decisions.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedbackMutation.mutate(data);
  };

  if (isLoadingBooking || isLoadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!booking || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-center">Booking Not Found</h2>
            <p className="text-muted-foreground text-center mt-2">
              The feedback link you're trying to access is invalid or expired.
            </p>
            <Button 
              onClick={() => setLocation("/")} 
              className="w-full mt-4"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingFeedback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-center">Feedback Already Submitted</h2>
            <p className="text-muted-foreground text-center mt-2">
              You've already provided feedback for this consultation. Thank you for your input!
            </p>
            <Button 
              onClick={() => setLocation("/")} 
              className="w-full mt-4"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Share Your Experience</CardTitle>
            <CardDescription className="text-center">
              Your feedback helps us improve our service and helps other women find the right specialist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Consultation Summary */}
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Your Recent Consultation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><strong>Date:</strong> {formatDate(booking.appointmentDate)}</p>
                <p><strong>Time:</strong> {booking.appointmentTime}</p>
                <p><strong>Doctor:</strong> Dr. {doctor.qualifications}</p>
                <p><strong>Specialty:</strong> {doctor.specialty}</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Star Rating */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        How would you rate your consultation?
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1 py-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="p-1 hover:scale-110 transition-transform"
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => field.onChange(star)}
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= (hoveredRating || watchedRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-3 text-sm text-muted-foreground">
                            {watchedRating > 0 && (
                              watchedRating === 5 ? "Excellent!" :
                              watchedRating === 4 ? "Very Good" :
                              watchedRating === 3 ? "Good" :
                              watchedRating === 2 ? "Fair" : "Needs Improvement"
                            )}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Written Comment */}
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Tell us about your experience (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share details about your consultation, the doctor's communication, or how the service helped you..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Anonymous Option */}
                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Submit this review anonymously
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Your name won't be shown with this review
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation("/")}
                  >
                    Skip
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={submitFeedbackMutation.isPending || watchedRating === 0}
                  >
                    {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="text-center text-sm text-muted-foreground mt-6 max-w-md mx-auto">
          <p>
            Your feedback is used to help other patients make informed decisions. 
            Reviews are moderated and personal information is kept confidential.
          </p>
        </div>
      </div>
    </div>
  );
}