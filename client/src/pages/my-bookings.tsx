import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, RotateCcw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Booking, Slot } from "@shared/schema";

export default function MyBookings() {
  const [email, setEmail] = useState("jane@example.com"); // In real app, get from auth
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update current time every minute to check for Zoom button availability
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: [`/api/bookings/user/${email}`],
    enabled: !!email,
  });

  const { data: availableSlots } = useQuery<Slot[]>({
    queryKey: [`/api/doctors/${selectedBooking?.doctorId}/slots`],
    enabled: !!selectedBooking?.doctorId,
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ bookingId, newSlotId }: { bookingId: number; newSlotId: number }) => {
      const response = await apiRequest("PUT", `/api/bookings/${bookingId}/reschedule`, { newSlotId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Rescheduled",
        description: "Your appointment has been successfully rescheduled. You'll receive an email confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/user/${email}`] });
      setSelectedBooking(null);
      setSelectedSlot(null);
    },
    onError: (error: any) => {
      toast({
        title: "Reschedule Failed",
        description: error.message || "Unable to reschedule your appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("PUT", `/api/bookings/${bookingId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled. You'll receive a refund within 3-5 business days.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/user/${email}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Unable to cancel your appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'rescheduled':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const canModifyBooking = (booking: Booking) => {
    if (booking.status !== "pending") return false;
    
    const now = new Date();
    const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}:00`);
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    return timeDiff >= twentyFourHours;
  };

  const canJoinZoom = (booking: Booking) => {
    if (booking.status !== 'pending') return false;
    
    const now = currentTime.getTime();
    const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}:00`);
    const timeDiff = appointmentDateTime.getTime() - now;
    const fifteenMinutes = 15 * 60 * 1000;
    const thirtyMinutes = 30 * 60 * 1000;
    
    // Allow joining 15 minutes before until 30 minutes after start time
    return timeDiff <= fifteenMinutes && timeDiff >= -thirtyMinutes;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReschedule = () => {
    if (selectedBooking && selectedSlot) {
      rescheduleMutation.mutate({ 
        bookingId: selectedBooking.id, 
        newSlotId: selectedSlot 
      });
    }
  };

  const handleCancel = (booking: Booking) => {
    cancelMutation.mutate(booking.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your upcoming and past consultations</p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600 mb-4">You don't have any appointments scheduled yet.</p>
              <Button onClick={() => window.location.href = "/"}>
                Book Your First Consultation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Consultation Appointment
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </span>
                      <div className="text-sm text-gray-500">
                        #{booking.id}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={16} />
                        <span className="font-medium">{formatDate(booking.appointmentDate.toString())}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="text-gray-400" size={16} />
                        <span>{booking.appointmentTime}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="text-gray-400" size={16} />
                        <span>Dr. Specialist</span>
                      </div>
                      {booking.reasonForConsultation && (
                        <div className="text-sm text-gray-600">
                          <strong>Reason:</strong> {booking.reasonForConsultation}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {canJoinZoom(booking) && (
                        <Button 
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                          size="sm"
                          onClick={() => window.open(booking.meetingUrl || `https://zoom.us/j/meeting-${booking.id}`, '_blank')}
                        >
                          <Video size={16} className="mr-2" />
                          Join Zoom Call
                        </Button>
                      )}
                      {canModifyBooking(booking) ? (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                                disabled={rescheduleMutation.isPending}
                              >
                                <RotateCcw size={16} className="mr-2" />
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reschedule Appointment</DialogTitle>
                                <DialogDescription>
                                  Choose a new time slot for your appointment.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="py-4">
                                <label className="block text-sm font-medium mb-2">
                                  Select New Time Slot
                                </label>
                                <Select onValueChange={(value) => setSelectedSlot(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a time slot" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableSlots?.filter(slot => slot.isAvailable).map((slot) => (
                                      <SelectItem key={slot.id} value={slot.id.toString()}>
                                        {formatDate(slot.date)} at {slot.time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setSelectedBooking(null);
                                    setSelectedSlot(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleReschedule}
                                  disabled={!selectedSlot || rescheduleMutation.isPending}
                                >
                                  {rescheduleMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={cancelMutation.isPending}
                              >
                                <XCircle size={16} className="mr-2" />
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Appointment</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel this appointment? 
                                  You'll receive a full refund within 3-5 business days.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <DialogFooter>
                                <Button variant="outline">
                                  Keep Appointment
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleCancel(booking)}
                                  disabled={cancelMutation.isPending}
                                >
                                  {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {booking.status === "cancelled" 
                            ? "Appointment cancelled" 
                            : "Cannot modify within 24 hours"
                          }
                        </div>
                      )}
                      
                      {booking.meetingUrl && booking.status === "confirmed" && (
                        <Button size="sm" asChild>
                          <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
                            Join Meeting
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}