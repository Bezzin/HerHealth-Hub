import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { generateSymptomSummary } from "./ai-service";
import { insertUserSchema, insertBookingSchema, insertDoctorInviteSchema, insertDoctorProfileSchema, insertSlotSchema, insertFeedbackSchema } from "@shared/schema";
import { sendBookingConfirmation, sendRescheduleConfirmation, sendCancellationConfirmation, sendFeedbackRequest } from "./notifications";
import { randomBytes } from "crypto";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = 'uploads/medical-history';
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `medical-history-${uniqueSuffix}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  }
});

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

  // Get individual booking
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: "Error retrieving booking: " + error.message });
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

      // Notify doctor via WebSocket
      (app as any).notifyDoctorOfNewBooking?.(slot.doctorId, {
        ...booking,
        patientName: `${userFirstName} ${userLastName}`
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

  // Reschedule booking
  app.put("/api/bookings/:id/reschedule", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { newSlotId } = req.body;

      if (!newSlotId) {
        return res.status(400).json({ message: "New slot ID is required" });
      }

      // Get original booking details for email
      const originalBooking = await storage.getBooking(bookingId);
      if (!originalBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const oldDateTime = {
        date: new Date(originalBooking.appointmentDate).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: originalBooking.appointmentTime
      };

      // Reschedule the booking
      const updatedBooking = await storage.rescheduleBooking(bookingId, newSlotId);

      // Send confirmation emails
      try {
        const doctor = await storage.getDoctorProfile(updatedBooking.doctorId);
        const patient = await storage.getUser(updatedBooking.patientId);
        
        if (doctor && patient) {
          await sendRescheduleConfirmation({ booking: updatedBooking, doctor, patient }, oldDateTime);
        }
      } catch (notificationError) {
        console.error("Error sending reschedule confirmation:", notificationError);
        // Don't fail the request if email sending fails
      }

      res.json(updatedBooking);
    } catch (error: any) {
      res.status(400).json({ message: "Error rescheduling booking: " + error.message });
    }
  });

  // Cancel booking
  app.put("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);

      // Get booking details for email before cancellation
      const originalBooking = await storage.getBooking(bookingId);
      if (!originalBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Cancel the booking
      const cancelledBooking = await storage.cancelBooking(bookingId);

      // Send confirmation emails
      try {
        const doctor = await storage.getDoctorProfile(cancelledBooking.doctorId);
        const patient = await storage.getUser(cancelledBooking.patientId);
        
        if (doctor && patient) {
          await sendCancellationConfirmation({ booking: cancelledBooking, doctor, patient });
        }
      } catch (notificationError) {
        console.error("Error sending cancellation confirmation:", notificationError);
        // Don't fail the request if email sending fails
      }

      res.json(cancelledBooking);
    } catch (error: any) {
      res.status(400).json({ message: "Error cancelling booking: " + error.message });
    }
  });

  // Mark booking as completed and trigger feedback request
  app.put("/api/bookings/:id/complete", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      // Update booking status to completed
      const completedBooking = await storage.updateBookingStatus(bookingId, "completed");
      
      // Send feedback request email
      try {
        const doctor = await storage.getDoctorProfile(completedBooking.doctorId);
        const patient = await storage.getUser(completedBooking.patientId);
        
        if (doctor && patient) {
          await sendFeedbackRequest({ booking: completedBooking, doctor, patient });
        }
      } catch (notificationError) {
        console.error("Error sending feedback request:", notificationError);
        // Don't fail the request if email sending fails
      }

      res.json(completedBooking);
    } catch (error: any) {
      res.status(400).json({ message: "Error completing booking: " + error.message });
    }
  });

  // Submit feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      
      // Check if feedback already exists for this booking
      const existingFeedback = await storage.getFeedbackByBooking(feedbackData.bookingId);
      if (existingFeedback) {
        return res.status(400).json({ message: "Feedback already submitted for this booking" });
      }

      // Verify booking exists and belongs to the patient
      const booking = await storage.getBooking(feedbackData.bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.patientId !== feedbackData.patientId) {
        return res.status(403).json({ message: "Unauthorized to submit feedback for this booking" });
      }

      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating feedback: " + error.message });
    }
  });

  // Get feedback for a specific booking
  app.get("/api/feedback/booking/:id", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const feedback = await storage.getFeedbackByBooking(bookingId);
      
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      res.json(feedback);
    } catch (error: any) {
      res.status(500).json({ message: "Error retrieving feedback: " + error.message });
    }
  });

  // Get doctor average rating
  app.get("/api/doctors/:id/rating", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const rating = await storage.getDoctorAverageRating(doctorId);
      res.json(rating);
    } catch (error: any) {
      res.status(500).json({ message: "Error retrieving doctor rating: " + error.message });
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

  // WebSocket server setup for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected doctors by doctorId for targeted notifications
  const connectedDoctors = new Map<number, WebSocket>();
  
  wss.on('connection', (ws, req) => {
    console.log('🔌 WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Doctor registration for notifications
        if (data.type === 'register' && data.doctorId) {
          connectedDoctors.set(data.doctorId, ws);
          console.log(`👨‍⚕️ Doctor ${data.doctorId} registered for notifications`);
          
          ws.send(JSON.stringify({
            type: 'registered',
            message: 'Successfully registered for notifications'
          }));
        }
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove doctor from connected list when they disconnect
      for (const [doctorId, socket] of Array.from(connectedDoctors.entries())) {
        if (socket === ws) {
          connectedDoctors.delete(doctorId);
          console.log(`👨‍⚕️ Doctor ${doctorId} disconnected`);
          break;
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  });

  // Function to notify doctors of new bookings
  const notifyDoctorOfNewBooking = (doctorId: number, bookingData: any) => {
    const doctorSocket = connectedDoctors.get(doctorId);
    
    if (doctorSocket && doctorSocket.readyState === WebSocket.OPEN) {
      doctorSocket.send(JSON.stringify({
        type: 'new_booking',
        data: {
          patientName: bookingData.patientName,
          appointmentDate: bookingData.appointmentDate,
          appointmentTime: bookingData.appointmentTime,
          reasonForConsultation: bookingData.reasonForConsultation,
          bookingId: bookingData.id
        }
      }));
      console.log(`📧 Notified doctor ${doctorId} of new booking ${bookingData.id}`);
    }
  };

  // Create user endpoint (for testing)
  app.post("/api/users", async (req, res) => {
    try {
      const { email, firstName, lastName, isDoctor } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser({ 
        email, 
        firstName, 
        lastName, 
        isDoctor: isDoctor || false 
      });
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating user: " + error.message });
    }
  });

  // Medical history upload endpoint
  app.post("/api/upload/history", upload.single('medicalHistory'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // For now, using hardcoded user ID. In real app, get from authentication
      const userId = 4; // This would come from req.user.id or similar
      
      // Store relative path for the uploaded file
      const filePath = `/uploads/medical-history/${req.file.filename}`;
      
      // Update user's medical history URL
      const updatedUser = await storage.updateMedicalHistoryUrl(userId, filePath);
      
      res.json({
        message: "Medical history uploaded successfully",
        url: filePath,
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error: any) {
      // Handle multer errors
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
      }
      if (error.message.includes('Invalid file type')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Error uploading file: " + error.message });
    }
  });

  // Get user's medical history
  app.get("/api/users/:id/medical-history", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        medicalHistoryUrl: user.medicalHistoryUrl,
        hasHistory: !!user.medicalHistoryUrl
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching medical history: " + error.message });
    }
  });

  // Serve uploaded files (for development only)
  app.get("/uploads/medical-history/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', 'medical-history', filename);
      
      // Check if file exists
      await fs.access(filePath);
      
      // Send the file
      res.sendFile(filePath);
    } catch (error) {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Symptom questionnaire endpoint
  app.post("/api/questionnaire", async (req, res) => {
    try {
      const { bookingId, answers } = req.body;
      
      if (!bookingId || !answers) {
        return res.status(400).json({ message: "Booking ID and answers are required" });
      }

      // Validate booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Generate AI summary from questionnaire answers
      const symptomSummary = await generateSymptomSummary(answers);
      
      // Store questionnaire data and AI summary
      const updatedBooking = await storage.updateBookingSymptoms(
        bookingId, 
        JSON.stringify(answers), 
        symptomSummary
      );

      res.json({
        message: "Questionnaire submitted successfully",
        booking: {
          id: updatedBooking.id,
          symptomSummary: updatedBooking.symptomSummary
        }
      });
    } catch (error: any) {
      console.error("Error processing questionnaire:", error);
      res.status(500).json({ message: "Error processing questionnaire: " + error.message });
    }
  });

  // Get booking symptom summary for doctors
  app.get("/api/bookings/:id/symptoms", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({
        symptomData: booking.symptomData ? JSON.parse(booking.symptomData) : null,
        symptomSummary: booking.symptomSummary,
        hasSymptoms: !!(booking.symptomData && booking.symptomSummary)
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching symptoms: " + error.message });
    }
  });

  // Attach notification function to app for use in routes
  (app as any).notifyDoctorOfNewBooking = notifyDoctorOfNewBooking;

  return httpServer;
}
