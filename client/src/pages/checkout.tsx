import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your consultation has been booked successfully!",
      });
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
        <PaymentElement />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
      >
        <div className="flex items-center justify-center space-x-2">
          <CreditCard size={20} />
          <span>{isProcessing ? 'Processing...' : 'Pay £55 & Complete Booking'}</span>
        </div>
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    const doctorId = urlParams.get('doctorId');
    
    if (!bookingId || !doctorId) {
      toast({
        title: "Error",
        description: "Missing booking information",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    // Fetch booking details
    Promise.all([
      apiRequest("GET", `/api/bookings/${bookingId}`),
      apiRequest("GET", `/api/doctors/${doctorId}`)
    ])
      .then(async ([bookingRes, doctorRes]) => {
        const booking = await bookingRes.json();
        const doctor = await doctorRes.json();
        setBookingDetails({ booking, doctor });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      });
    
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: 55, // £55 consultation fee
      bookingId: bookingId ? parseInt(bookingId) : undefined
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment",
          variant: "destructive",
        });
      });
  }, [toast]);

  if (!clientSecret || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Button>
          </div>

          <Card className="bg-white rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
                <p className="text-gray-600">Secure payment powered by Stripe</p>
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-medium">£55.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">20 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">Video Consultation</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>£55.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Your payment is secured with 256-bit SSL encryption</p>
                <p>By completing this payment, you agree to our Terms of Service</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
