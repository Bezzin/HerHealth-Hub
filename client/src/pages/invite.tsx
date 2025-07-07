import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, UserPlus } from "lucide-react";

const onboardingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  specialty: z.string().min(1, "Specialty is required"),
  qualifications: z.string().min(10, "Please provide your qualifications"),
  experience: z.string().min(10, "Please describe your experience"),
  bio: z.string().optional(),
  email: z.string().email(),
  slots: z.array(z.object({
    date: z.string(),
    time: z.string(),
  })).min(1, "Please select at least one availability slot"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const specialties = [
  "General Practice",
  "Women's Health",
  "Gynecology",
  "Fertility & Reproductive Health",
  "Menopause & Hormone Health",
  "Mental Health",
  "Dermatology",
];

const timeSlots = [
  "09:00", "10:30", "14:00", "15:30"
];

export default function Invite() {
  const [, params] = useRoute("/invite/:token");
  const token = params?.token;
  const [inviteData, setInviteData] = useState<{ email: string; token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState<Array<{ date: string; time: string }>>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      specialty: "",
      qualifications: "",
      experience: "",
      bio: "",
      email: "",
      slots: [],
    },
  });

  // Generate next 7 days for slot selection
  const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  useEffect(() => {
    if (token) {
      validateInvite();
    }
  }, [token]);

  const validateInvite = async () => {
    try {
      const response = await apiRequest("GET", `/api/doctor/invite/${token}`);
      const data = await response.json();
      setInviteData(data);
      // Set email in form
      form.setValue("email", data.email);
    } catch (error: any) {
      toast({
        title: "Invalid Invite",
        description: "This invite link is invalid or has expired.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (date: string, time: string) => {
    const slotKey = `${date}-${time}`;
    const existingIndex = selectedSlots.findIndex(slot => `${slot.date}-${slot.time}` === slotKey);
    
    let newSlots;
    if (existingIndex >= 0) {
      newSlots = selectedSlots.filter((_, index) => index !== existingIndex);
    } else {
      newSlots = [...selectedSlots, { date, time }];
    }
    
    setSelectedSlots(newSlots);
    form.setValue("slots", newSlots);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const response = await apiRequest("POST", "/api/doctor/complete", {
        ...data,
        token,
        slots: selectedSlots,
      });

      const result = await response.json();

      toast({
        title: "Profile Created!",
        description: "Setting up your payment account...",
      });

      // Create Stripe Connect account
      try {
        const stripeResponse = await apiRequest("POST", "/api/doctor/stripe-account", {
          doctorId: result.doctorId,
          email: data.email,
        });
        
        const stripeResult = await stripeResponse.json();
        
        // Redirect to Stripe onboarding
        window.location.href = stripeResult.accountLinkUrl;
      } catch (stripeError: any) {
        console.error("Stripe account creation failed:", stripeError);
        toast({
          title: "Payment Setup Error", 
          description: "Profile created but payment setup failed. You can complete this later.",
          variant: "destructive",
        });
        
        // Still redirect to dashboard even if Stripe setup fails
        setTimeout(() => {
          window.location.href = "/dashboard/doctor";
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Invite</CardTitle>
            <CardDescription>
              This invite link is invalid or has expired. Please contact the administrator for a new invite.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Welcome to HerHealth Hub!</CardTitle>
            <CardDescription>
              Your doctor profile has been created successfully. You can now start offering consultations to patients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/"}>
              Go to Platform
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Doctor Onboarding</h1>
          <p className="text-gray-600 mt-2">Welcome, {inviteData.email}</p>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>1</div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>2</div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>3</div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Personal Information"}
              {step === 2 && "Professional Details"}
              {step === 3 && "Availability Slots"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Share your professional background"}
              {step === 3 && "Set your initial availability (you can add more later)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Specialty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="qualifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualifications</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., MBBS, MD, MRCOG, GMC Number..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your professional experience, years of practice, areas of expertise..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="A brief bio that patients will see on your profile..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Select your availability for the next 7 days</h4>
                      <p className="text-sm text-gray-600 mb-4">Click on time slots to toggle availability. You can modify this later.</p>
                      
                      <div className="space-y-3">
                        {dateOptions.map((date) => (
                          <div key={date.value} className="border rounded-lg p-3">
                            <h5 className="font-medium text-sm mb-2">{date.label}</h5>
                            <div className="grid grid-cols-4 gap-2">
                              {timeSlots.map((time) => {
                                const isSelected = selectedSlots.some(slot => 
                                  slot.date === date.value && slot.time === time
                                );
                                return (
                                  <Button
                                    key={time}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 text-xs ${
                                      isSelected 
                                        ? 'bg-primary text-white border-primary' 
                                        : 'hover:bg-primary/10'
                                    }`}
                                    onClick={() => toggleSlot(date.value, time)}
                                  >
                                    {time}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedSlots.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700">
                            {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </Button>
                  )}
                  
                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="ml-auto"
                      disabled={
                        (step === 1 && (!form.watch("firstName") || !form.watch("lastName") || !form.watch("specialty"))) ||
                        (step === 2 && (!form.watch("qualifications") || !form.watch("experience")))
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="ml-auto"
                      disabled={selectedSlots.length === 0 || form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        "Complete Onboarding"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}