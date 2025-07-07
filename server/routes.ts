import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema, insertDoctorInviteSchema, insertDoctorProfileSchema, insertSlotSchema } from "@shared/schema";
import { sendBookingConfirmation } from "./notifications";
import { randomBytes } from "crypto";

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
      const { slotId, email, firstName, lastName, reasonForConsultation, patientName, patientEmail, patientPhone } = req.body;
      
      // Handle both old and new API formats
      const userEmail = email || patientEmail;
      let userFirstName = firstName;
      let userLastName = lastName;
      
      if (patientName && !firstName) {
        const [first, ...lastParts] = patientName.split(' ');
        userFirstName = first;
        userLastName = lastParts.join(' ');
      }
      
      // Verify slot exists and is available
      const slot = await storage.getSlot(slotId);
      if (!slot || !slot.isAvailable) {
        return res.status(400).json({ message: "Slot is not available" });
      }

      // Create or get user
      let user = await storage.getUserByEmail(userEmail);
      if (!user) {
        user = await storage.createUser({
          email: userEmail,
          firstName: userFirstName,
          lastName: userLastName,
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
        patientPhone: patientPhone || null,
      });

      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating booking: " + error.message });
    }
  });

  // Create Stripe Connect account for doctor
  app.post("/api/doctor/stripe-account", async (req, res) => {
    try {
      const { doctorId, email } = req.body;
      
      console.log("Creating Stripe account for doctor:", doctorId, email);
      
      // In development, simulate Stripe Connect setup since it requires platform approval
      if (process.env.NODE_ENV === 'development') {
        // Create fake account ID for testing
        const fakeAccountId = `acct_test_${Math.random().toString(36).substring(7)}`;
        
        // Save the fake account ID to doctor profile
        await storage.updateDoctorStripeAccount(doctorId, fakeAccountId);
        
        console.log("Created test Stripe account:", fakeAccountId);
        
        // Return fake account link that redirects to success
        res.json({ 
          accountId: fakeAccountId,
          accountLinkUrl: `${req.headers.origin}/dashboard/doctor?stripe_success=true`
        });
        return;
      }
      
      // Production: Create real Express account (requires Stripe Connect approval)
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB',
        email: email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      
      console.log("Created Stripe account:", account.id);
      
      // Save the account ID to doctor profile
      await storage.updateDoctorStripeAccount(doctorId, account.id);
      
      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.origin}/dashboard/doctor?stripe_error=true`,
        return_url: `${req.headers.origin}/dashboard/doctor?stripe_success=true`,
        type: 'account_onboarding',
      });
      
      res.json({ 
        accountId: account.id,
        accountLinkUrl: accountLink.url 
      });
    } catch (error: any) {
      console.error("Stripe account creation error:", error);
      res.status(500).json({ 
        message: "Error creating Stripe account: " + error.message 
      });
    }
  });

  // Get Stripe account status
  app.get("/api/doctor/:doctorId/stripe-status", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const doctor = await storage.getDoctorProfile(doctorId);
      
      if (!doctor || !doctor.stripeAccountId) {
        return res.json({ connected: false });
      }
      
      // In development, simulate connected status for test accounts
      if (process.env.NODE_ENV === 'development' && doctor.stripeAccountId.startsWith('acct_test_')) {
        return res.json({
          connected: true,
          accountId: doctor.stripeAccountId,
          detailsSubmitted: true,
          chargesEnabled: true,
        });
      }
      
      // Production: Check real Stripe account status
      const account = await stripe.accounts.retrieve(doctor.stripeAccountId);
      
      res.json({
        connected: account.details_submitted && account.charges_enabled,
        accountId: doctor.stripeAccountId,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
      });
    } catch (error: any) {
      console.error("Stripe account status error:", error);
      res.status(500).json({ 
        message: "Error checking Stripe status: " + error.message 
      });
    }
  });

  // Stripe payment route with Connect destination payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      
      console.log("Creating payment intent with:", { amount, bookingId });
      
      let paymentIntentData: any = {
        amount: Math.round(amount * 100), // Convert to pence
        currency: "gbp",
        metadata: {
          bookingId: bookingId?.toString() || "",
        },
      };
      
      // If booking exists, set up revenue splitting with connected account
      if (bookingId) {
        const booking = await storage.getBooking(bookingId);
        console.log("Found booking:", booking);
        
        if (booking) {
          const doctor = await storage.getDoctorProfile(booking.doctorId);
          console.log("Found doctor:", doctor);
          
          if (doctor && doctor.stripeAccountId) {
            // In development, simulate destination payment with test accounts
            if (process.env.NODE_ENV === 'development' && doctor.stripeAccountId.startsWith('acct_test_')) {
              console.log("Development mode: simulating Stripe Connect payment for:", doctor.stripeAccountId);
              // Add metadata to track the revenue split for development
              paymentIntentData.metadata.stripeAccountId = doctor.stripeAccountId;
              paymentIntentData.metadata.platformFee = "20.00";
              paymentIntentData.metadata.doctorEarnings = "35.00";
            } else {
              // Production: Use real destination payment
              paymentIntentData.transfer_data = {
                destination: doctor.stripeAccountId,
              };
              paymentIntentData.application_fee_amount = 2000; // £20 platform fee
              console.log("Using Stripe Connect destination payment for doctor:", doctor.stripeAccountId);
            }
          } else {
            console.log("Doctor has no Stripe account, using standard payment");
          }
        }
      }
      
      console.log("Creating Stripe payment intent with data:", paymentIntentData);
      
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

      console.log("Payment intent created successfully:", paymentIntent.id);

      // Update booking with payment intent if booking exists
      if (bookingId) {
        await storage.updateBookingPayment(bookingId, paymentIntent.id);
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent creation error:", {
        message: error.message,
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param,
        stack: error.stack
      });
      
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message,
        error: {
          type: error.type,
          code: error.code,
          param: error.param
        }
      });
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
          // Update booking status
          const booking = await storage.updateBookingStatus(parseInt(bookingId), "confirmed");
          
          // Send booking confirmation emails
          try {
            const doctor = await storage.getDoctorProfile(booking.doctorId);
            const patient = await storage.getUser(booking.patientId);
            
            if (doctor && patient) {
              await sendBookingConfirmation({ booking, doctor, patient });
            }
          } catch (notificationError) {
            console.error("Error sending booking confirmation:", notificationError);
            // Don't fail the webhook if email sending fails
          }
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: "Webhook error: " + error.message });
    }
  });

  // Test endpoint to manually trigger reminder checking
  app.get("/api/test-reminders", async (req, res) => {
    try {
      const bookingsNeedingReminders = await storage.getBookingsNeedingReminders();
      console.log(`🔍 Test: Found ${bookingsNeedingReminders.length} booking(s) needing reminders`);
      
      const results = [];
      
      for (const booking of bookingsNeedingReminders) {
        const doctor = await storage.getDoctorProfile(booking.doctorId);
        const patient = await storage.getUser(booking.patientId);
        
        if (doctor && patient) {
          const details = { booking, doctor, patient };
          
          // Test the notification functions (they'll log warnings if services not configured)
          console.log(`📧 Test: Would send reminders for booking #${booking.id}`);
          console.log(`   📅 Appointment: ${booking.appointmentDate} at ${booking.appointmentTime}`);
          console.log(`   👩 Patient: ${patient.firstName} ${patient.lastName} (${patient.email})`);
          console.log(`   📱 Phone: ${booking.patientPhone || 'Not provided'}`);
          
          results.push({
            bookingId: booking.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientEmail: patient.email,
            patientPhone: booking.patientPhone,
            appointmentDate: booking.appointmentDate,
            appointmentTime: booking.appointmentTime,
            doctorSpecialty: doctor.specialty,
          });
        }
      }
      
      res.json({ 
        message: `Found ${bookingsNeedingReminders.length} bookings needing reminders`,
        bookings: results,
        note: "This is a test endpoint. In production, reminders run automatically every hour."
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking reminders: " + error.message });
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

  // Create doctor invite
  app.post("/api/doctor/invite", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Generate unique token
      const token = randomBytes(32).toString('hex');
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invite = await storage.createDoctorInvite({
        email,
        token,
        expiresAt,
      });

      // In production, you'd send an email with the invite link
      const inviteUrl = `${req.protocol}://${req.get('host')}/invite/${token}`;
      
      res.json({ 
        message: "Invite created successfully",
        inviteUrl, // For demo purposes, return the URL
        token: token // For demo purposes
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating invite: " + error.message });
    }
  });

  // Validate doctor invite token
  app.get("/api/doctor/invite/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const invite = await storage.getDoctorInviteByToken(token);
      
      if (!invite) {
        return res.status(404).json({ message: "Invalid or expired invite" });
      }

      res.json({ email: invite.email, token: invite.token });
    } catch (error: any) {
      res.status(500).json({ message: "Error validating invite: " + error.message });
    }
  });

  // Complete doctor onboarding
  app.post("/api/doctor/complete", async (req, res) => {
    try {
      const { token, firstName, lastName, specialty, qualifications, experience, bio, slots } = req.body;
      
      // Validate invite token
      const invite = await storage.getDoctorInviteByToken(token);
      if (!invite) {
        return res.status(400).json({ message: "Invalid or expired invite" });
      }

      // Create user account for doctor
      const user = await storage.createUser({
        email: invite.email,
        firstName,
        lastName,
        isDoctor: true,
      });

      // Create doctor profile
      const doctorProfile = await storage.createDoctorProfile({
        userId: user.id,
        specialty,
        qualifications,
        experience,
        bio: bio || `Experienced ${specialty} specialist providing expert care.`,
      });

      // Create initial availability slots
      if (slots && Array.isArray(slots)) {
        for (const slot of slots) {
          await storage.createSlot({
            doctorId: doctorProfile.id,
            date: slot.date,
            time: slot.time,
            isAvailable: true,
          });
        }
      }

      // Mark invite as used
      await storage.markInviteAsUsed(invite.id);

      res.json({ 
        message: "Doctor onboarding completed successfully",
        doctorId: doctorProfile.id,
        userId: user.id,
        redirectUrl: "/dashboard/doctor"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error completing onboarding: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
