import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getAllDoctorProfiles();
      res.json(doctors);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching doctors: " + error.message });
    }
  });

  // Get specific doctor
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await storage.getDoctorProfile(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching doctor: " + error.message });
    }
  });

  // Get available slots for a doctor
  app.get("/api/doctors/:id/slots", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const slots = await storage.getAvailableSlots(doctorId);
      res.json(slots);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching slots: " + error.message });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const { slotId, email, firstName, lastName, reasonForConsultation } = req.body;
      
      // Verify slot exists and is available
      const slot = await storage.getSlot(slotId);
      if (!slot || !slot.isAvailable) {
        return res.status(400).json({ message: "Slot is not available" });
      }

      // Create or get user
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email,
          firstName,
          lastName,
          isDoctor: false,
        });
      }

      // Get doctor profile
      const doctor = await storage.getDoctorProfile(slot.doctorId);
      if (!doctor) {
        return res.status(400).json({ message: "Doctor not found" });
      }

      // Create appointment date/time from slot
      const appointmentDate = new Date(`${slot.date}T${slot.time}:00`);

      // Create booking
      const booking = await storage.createBooking({
        patientId: user.id,
        doctorId: slot.doctorId,
        slotId: slot.id,
        appointmentDate,
        appointmentTime: slot.time,
        reasonForConsultation,
      });

      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating booking: " + error.message });
    }
  });

  // Stripe payment route for consultation payments with revenue splitting
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      
      let transferGroup = undefined;
      let applicationFeeAmount = undefined;
      
      // If booking exists, set up revenue splitting
      if (bookingId) {
        const booking = await storage.getBooking(bookingId);
        if (booking) {
          const doctor = await storage.getDoctorProfile(booking.doctorId);
          transferGroup = `booking_${bookingId}`;
          
          // Platform takes £20, doctor gets £35 out of £55
          applicationFeeAmount = 20 * 100; // £20 in pence
          
          // Note: In production, you'd need the doctor's Stripe Connect account ID
          // This requires implementing Stripe Connect onboarding for doctors
        }
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency: "gbp",
        application_fee_amount: applicationFeeAmount,
        transfer_group: transferGroup,
        metadata: {
          bookingId: bookingId?.toString() || "",
        },
      });

      // Update booking with payment intent if booking exists
      if (bookingId) {
        await storage.updateBookingPayment(bookingId, paymentIntent.id);
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook for Stripe payment confirmation
  app.post("/api/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      // In production, you'd verify the webhook signature here
      const event = req.body;

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;
        
        if (bookingId) {
          await storage.updateBookingStatus(parseInt(bookingId), "confirmed");
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: "Webhook error: " + error.message });
    }
  });

  // Get user bookings
  app.get("/api/bookings/user/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const bookings = await storage.getBookingsByPatient(user.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bookings: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
