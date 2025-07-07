import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Users, PoundSterling, Settings, Home, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DoctorStats {
  totalBookings: number;
  todayBookings: number;
  weeklyEarnings: number;
  availableSlots: number;
}

interface Booking {
  id: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reasonForConsultation: string;
}

interface Slot {
  id: number;
  date: string;
  time: string;
  isAvailable: boolean;
}

export default function DoctorDashboard() {
  const search = useSearch();
  const { toast } = useToast();
  const [doctorId] = useState(4); // In real app, get from auth context
  
  const [stats] = useState<DoctorStats>({
    totalBookings: 12,
    todayBookings: 3,
    weeklyEarnings: 420,
    availableSlots: 8,
  });

  // Check Stripe Connect status
  const { data: stripeStatus, refetch: refetchStripeStatus } = useQuery({
    queryKey: ['/api/doctor', doctorId, 'stripe-status'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/doctor/${doctorId}/stripe-status`);
      return response.json();
    },
  });

  // Handle Stripe Connect success/error callbacks
  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const stripeSuccess = urlParams.get('stripe_success');
    const stripeError = urlParams.get('stripe_error');
    
    if (stripeSuccess === 'true') {
      toast({
        title: "Payment Setup Complete!",
        description: "Your Stripe account has been connected successfully.",
      });
      refetchStripeStatus();
    } else if (stripeError === 'true') {
      toast({
        title: "Payment Setup Error",
        description: "There was an issue setting up your payment account. Please try again.",
        variant: "destructive",
      });
    }
  }, [search, toast, refetchStripeStatus]);

  const [upcomingBookings] = useState<Booking[]>([
    {
      id: 1,
      patientName: "Sarah Johnson",
      appointmentDate: "2025-07-08",
      appointmentTime: "09:00",
      status: "confirmed",
      reasonForConsultation: "Menopause consultation",
    },
    {
      id: 2,
      patientName: "Emma Smith",
      appointmentDate: "2025-07-08",
      appointmentTime: "10:30",
      status: "confirmed",
      reasonForConsultation: "Fertility advice",
    },
    {
      id: 3,
      patientName: "Lisa Brown",
      appointmentDate: "2025-07-08",
      appointmentTime: "14:00",
      status: "pending",
      reasonForConsultation: "General women's health",
    },
  ]);

  const [availableSlots] = useState<Slot[]>([
    { id: 1, date: "2025-07-08", time: "15:30", isAvailable: true },
    { id: 2, date: "2025-07-09", time: "09:00", isAvailable: true },
    { id: 3, date: "2025-07-09", time: "10:30", isAvailable: true },
    { id: 4, date: "2025-07-09", time: "14:00", isAvailable: true },
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your practice overview.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                <Home className="w-4 h-4 mr-2" />
                Platform
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Slots
              </Button>
            </div>
          </div>
          
          {/* Stripe Connect Status */}
          {stripeStatus && !stripeStatus.connected && (
            <div className="pb-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Complete your payment setup to start earning from consultations.
                  <Button 
                    className="ml-2" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await apiRequest("POST", "/api/doctor/stripe-account", {
                          doctorId,
                          email: "doctor@example.com", // In real app, get from user context
                        });
                        const result = await response.json();
                        window.location.href = result.accountLinkUrl;
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to setup payment account. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Complete Setup
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {stripeStatus && stripeStatus.connected && (
            <div className="pb-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Payment account connected successfully! You're ready to receive payments.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayBookings}</div>
              <p className="text-xs text-muted-foreground">
                3 consultations scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
              <PoundSterling className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.weeklyEarnings}</div>
              <p className="text-xs text-muted-foreground">
                +£35 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableSlots}</div>
              <p className="text-xs text-muted-foreground">
                Next 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Upcoming Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Consultations</CardTitle>
                <CardDescription>
                  Your scheduled patient consultations for the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.patientName}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.appointmentDate)} at {booking.appointmentTime}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {booking.reasonForConsultation}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Join Meeting
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Your Availability</CardTitle>
                <CardDescription>
                  Manage your available time slots for patient bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {formatDate(slot.date)} at {slot.time}
                        </h4>
                        <p className="text-sm text-gray-600">
                          30-minute consultation slot
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Available</Badge>
                        <Button size="sm" variant="outline">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Slots
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>
                  Your consultation earnings and payment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-green-600">£420</h3>
                      <p className="text-sm text-green-700">This Week</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-600">£1,680</h3>
                      <p className="text-sm text-blue-700">This Month</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Recent Payments</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>July 7 - Sarah Johnson</span>
                        <span className="font-medium">£35.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>July 6 - Emma Smith</span>
                        <span className="font-medium">£35.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>July 5 - Lisa Brown</span>
                        <span className="font-medium">£35.00</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Stripe Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
                <CardDescription>
                  Manage your professional profile and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Specialty</label>
                      <p className="text-gray-900">Women's Health</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience</label>
                      <p className="text-gray-900">8+ years</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Qualifications</label>
                    <p className="text-gray-900">MBBS, MRCOG, GMC: 7654321</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <p className="text-gray-900">
                      Experienced Women's Health specialist providing expert care in gynecology, 
                      fertility, and menopause management.
                    </p>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}