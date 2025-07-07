import { users, doctorProfiles, slots, bookings, doctorInvites, feedbacks, type User, type InsertUser, type DoctorProfile, type InsertDoctorProfile, type Slot, type InsertSlot, type Booking, type InsertBooking, type DoctorInvite, type InsertDoctorInvite, type Feedback, type InsertFeedback } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;

  // Doctor operations
  getDoctorProfile(id: number): Promise<DoctorProfile | undefined>;
  getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined>;
  getAllDoctorProfiles(): Promise<DoctorProfile[]>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  updateDoctorStripeAccount(doctorId: number, stripeAccountId: string): Promise<DoctorProfile>;

  // Slot operations
  getSlot(id: number): Promise<Slot | undefined>;
  getSlotsByDoctor(doctorId: number): Promise<Slot[]>;
  getAvailableSlots(doctorId: number): Promise<Slot[]>;
  createSlot(slot: InsertSlot): Promise<Slot>;
  updateSlotAvailability(slotId: number, isAvailable: boolean): Promise<Slot>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByPatient(patientId: number): Promise<Booking[]>;
  getBookingsByDoctor(doctorId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingPayment(bookingId: number, paymentIntentId: string): Promise<Booking>;
  updateBookingStatus(bookingId: number, status: string): Promise<Booking>;
  markRemindersSent(bookingId: number): Promise<Booking>;
  getBookingsNeedingReminders(): Promise<Booking[]>;
  rescheduleBooking(bookingId: number, newSlotId: number): Promise<Booking>;
  cancelBooking(bookingId: number): Promise<Booking>;

  // Doctor invite operations
  createDoctorInvite(invite: InsertDoctorInvite): Promise<DoctorInvite>;
  getDoctorInviteByToken(token: string): Promise<DoctorInvite | undefined>;
  markInviteAsUsed(inviteId: number): Promise<DoctorInvite>;
  cleanupExpiredInvites(): Promise<void>;

  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedback(id: number): Promise<Feedback | undefined>;
  getFeedbackByBooking(bookingId: number): Promise<Feedback | undefined>;
  getFeedbacksByDoctor(doctorId: number): Promise<Feedback[]>;
  getDoctorAverageRating(doctorId: number): Promise<{ averageRating: number; totalFeedbacks: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctorProfiles: Map<number, DoctorProfile>;
  private slots: Map<number, Slot>;
  private bookings: Map<number, Booking>;
  private doctorInvites: Map<number, DoctorInvite>;
  private feedbacks: Map<number, Feedback>;
  private currentUserId: number;
  private currentDoctorId: number;
  private currentSlotId: number;
  private currentBookingId: number;
  private currentInviteId: number;
  private currentFeedbackId: number;

  constructor() {
    this.users = new Map();
    this.doctorProfiles = new Map();
    this.slots = new Map();
    this.bookings = new Map();
    this.doctorInvites = new Map();
    this.feedbacks = new Map();
    this.currentUserId = 1;
    this.currentDoctorId = 1;
    this.currentSlotId = 1;
    this.currentBookingId = 1;
    this.currentInviteId = 1;
    this.currentFeedbackId = 1;
    
    // Seed with sample doctors and slots
    this.seedDoctors();
  }

  private async seedDoctors() {
    // Create sample doctors
    const doctor1 = await this.createUser({
      email: "sarah.johnson@herhealth.com",
      firstName: "Sarah",
      lastName: "Johnson",
      isDoctor: true,
    });

    const doctor2 = await this.createUser({
      email: "emily.chen@herhealth.com",
      firstName: "Emily",
      lastName: "Chen",
      isDoctor: true,
    });

    const doctor3 = await this.createUser({
      email: "rebecca.martinez@herhealth.com",
      firstName: "Rebecca",
      lastName: "Martinez",
      isDoctor: true,
    });

    // Create doctor profiles
    const profile1 = await this.createDoctorProfile({
      userId: doctor1.id,
      specialty: "General Practice",
      qualifications: "MB ChB, MRCGP",
      experience: "8 years experience",
      bio: "Specializing in women's health and general practice with a focus on preventive care.",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    });

    const profile2 = await this.createDoctorProfile({
      userId: doctor2.id,
      specialty: "Women's Health",
      qualifications: "MD, FACOG",
      experience: "12 years experience",
      bio: "Board-certified gynecologist specializing in reproductive health and hormonal disorders.",
      profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    });

    const profile3 = await this.createDoctorProfile({
      userId: doctor3.id,
      specialty: "Mental Health",
      qualifications: "PhD, LMFT",
      experience: "15 years experience",
      bio: "Licensed therapist specializing in women's mental health and wellness.",
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    });

    // Create slots for next 7 days for each doctor
    const today = new Date();
    const times = ["09:00", "10:30", "14:00", "15:30"];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Create 4 slots per day for each doctor
      for (const time of times) {
        await this.createSlot({
          doctorId: profile1.id,
          date: dateStr,
          time,
          isAvailable: true,
        });
        
        await this.createSlot({
          doctorId: profile2.id,
          date: dateStr,
          time,
          isAvailable: true,
        });
        
        await this.createSlot({
          doctorId: profile3.id,
          date: dateStr,
          time,
          isAvailable: true,
        });
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isDoctor: insertUser.isDoctor ?? false,
      stripeCustomerId: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    return this.doctorProfiles.get(id);
  }

  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    return Array.from(this.doctorProfiles.values()).find(profile => profile.userId === userId);
  }

  async getAllDoctorProfiles(): Promise<DoctorProfile[]> {
    return Array.from(this.doctorProfiles.values());
  }

  async createDoctorProfile(insertProfile: InsertDoctorProfile): Promise<DoctorProfile> {
    const id = this.currentDoctorId++;
    const profile: DoctorProfile = {
      ...insertProfile,
      id,
      bio: insertProfile.bio ?? null,
      profileImage: insertProfile.profileImage ?? null,
      rating: "4.9",
      reviewCount: Math.floor(Math.random() * 200) + 50,
      availability: "Available today",
      stripeAccountId: null,
    };
    this.doctorProfiles.set(id, profile);
    return profile;
  }

  async updateDoctorStripeAccount(doctorId: number, stripeAccountId: string): Promise<DoctorProfile> {
    const profile = this.doctorProfiles.get(doctorId);
    if (!profile) throw new Error("Doctor profile not found");
    
    const updatedProfile = { ...profile, stripeAccountId };
    this.doctorProfiles.set(doctorId, updatedProfile);
    return updatedProfile;
  }

  async getSlot(id: number): Promise<Slot | undefined> {
    return this.slots.get(id);
  }

  async getSlotsByDoctor(doctorId: number): Promise<Slot[]> {
    return Array.from(this.slots.values()).filter(slot => slot.doctorId === doctorId);
  }

  async getAvailableSlots(doctorId: number): Promise<Slot[]> {
    return Array.from(this.slots.values()).filter(slot => 
      slot.doctorId === doctorId && slot.isAvailable
    );
  }

  async createSlot(insertSlot: InsertSlot): Promise<Slot> {
    const id = this.currentSlotId++;
    const slot: Slot = {
      ...insertSlot,
      id,
      isAvailable: insertSlot.isAvailable ?? true,
      createdAt: new Date(),
    };
    this.slots.set(id, slot);
    return slot;
  }

  async updateSlotAvailability(slotId: number, isAvailable: boolean): Promise<Slot> {
    const slot = this.slots.get(slotId);
    if (!slot) throw new Error("Slot not found");
    
    const updatedSlot = { ...slot, isAvailable };
    this.slots.set(slotId, updatedSlot);
    return updatedSlot;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByPatient(patientId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.patientId === patientId);
  }

  async getBookingsByDoctor(doctorId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.doctorId === doctorId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      reasonForConsultation: insertBooking.reasonForConsultation ?? null,
      patientPhone: insertBooking.patientPhone ?? null,
      status: "pending",
      paymentIntentId: null,
      meetingUrl: null,
      remindersSent: false,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    
    // Mark the slot as unavailable
    await this.updateSlotAvailability(insertBooking.slotId, false);
    
    return booking;
  }

  async updateBookingPayment(bookingId: number, paymentIntentId: string): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { ...booking, paymentIntentId, status: "confirmed" };
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  async updateBookingStatus(bookingId: number, status: string): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  // Doctor invite operations
  async createDoctorInvite(insertInvite: InsertDoctorInvite): Promise<DoctorInvite> {
    const invite: DoctorInvite = {
      id: this.currentInviteId++,
      email: insertInvite.email,
      token: insertInvite.token,
      isUsed: false,
      expiresAt: insertInvite.expiresAt,
      createdAt: new Date(),
    };
    this.doctorInvites.set(invite.id, invite);
    return invite;
  }

  async getDoctorInviteByToken(token: string): Promise<DoctorInvite | undefined> {
    const invites = Array.from(this.doctorInvites.values());
    for (const invite of invites) {
      if (invite.token === token && !invite.isUsed && invite.expiresAt > new Date()) {
        return invite;
      }
    }
    return undefined;
  }

  async markInviteAsUsed(inviteId: number): Promise<DoctorInvite> {
    const invite = this.doctorInvites.get(inviteId);
    if (!invite) throw new Error("Invite not found");
    
    const updatedInvite = { ...invite, isUsed: true };
    this.doctorInvites.set(inviteId, updatedInvite);
    return updatedInvite;
  }

  async cleanupExpiredInvites(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.doctorInvites.entries());
    for (const [id, invite] of entries) {
      if (invite.expiresAt < now) {
        this.doctorInvites.delete(id);
      }
    }
  }

  async markRemindersSent(bookingId: number): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${bookingId} not found`);
    }
    
    const updatedBooking = { ...booking, remindersSent: true };
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  async getBookingsNeedingReminders(): Promise<Booking[]> {
    const now = new Date();
    const twentyThreeHours = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
    const twentyFiveHours = 25 * 60 * 60 * 1000; // 25 hours in milliseconds
    
    return Array.from(this.bookings.values()).filter(booking => {
      if (booking.remindersSent || booking.status !== 'confirmed') {
        return false;
      }
      
      const appointmentTime = new Date(booking.appointmentDate);
      const timeDiff = appointmentTime.getTime() - now.getTime();
      
      // Send reminders for bookings that are 24±1 hours away
      return timeDiff >= twentyThreeHours && timeDiff <= twentyFiveHours;
    });
  }

  async rescheduleBooking(bookingId: number, newSlotId: number): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${bookingId} not found`);
    }

    // Check if booking can be rescheduled (24h in advance)
    const now = new Date();
    const appointmentTime = new Date(booking.appointmentDate);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (timeDiff < twentyFourHours) {
      throw new Error('Bookings can only be rescheduled 24 hours in advance');
    }

    // Verify new slot exists and is available
    const newSlot = await this.getSlot(newSlotId);
    if (!newSlot || !newSlot.isAvailable) {
      throw new Error('Selected time slot is not available');
    }

    // Release the old slot
    await this.updateSlotAvailability(booking.slotId, true);

    // Reserve the new slot
    await this.updateSlotAvailability(newSlotId, false);

    // Update booking with new slot details
    const newAppointmentDate = new Date(`${newSlot.date}T${newSlot.time}:00`);
    const updatedBooking = {
      ...booking,
      slotId: newSlotId,
      appointmentDate: newAppointmentDate,
      appointmentTime: newSlot.time,
      remindersSent: false, // Reset reminder status for new appointment time
    };

    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  async cancelBooking(bookingId: number): Promise<Booking> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${bookingId} not found`);
    }

    // Check if booking can be cancelled (24h in advance)
    const now = new Date();
    const appointmentTime = new Date(booking.appointmentDate);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (timeDiff < twentyFourHours) {
      throw new Error('Bookings can only be cancelled 24 hours in advance');
    }

    // Release the slot
    await this.updateSlotAvailability(booking.slotId, true);

    // Update booking status
    const cancelledBooking = { ...booking, status: 'cancelled' };
    this.bookings.set(bookingId, cancelledBooking);
    return cancelledBooking;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const feedback: Feedback = {
      id: this.currentFeedbackId++,
      bookingId: insertFeedback.bookingId,
      doctorId: insertFeedback.doctorId,
      patientId: insertFeedback.patientId,
      rating: insertFeedback.rating,
      comment: insertFeedback.comment || null,
      isAnonymous: insertFeedback.isAnonymous || null,
      createdAt: new Date(),
    };
    
    this.feedbacks.set(feedback.id, feedback);
    return feedback;
  }

  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbacks.get(id);
  }

  async getFeedbackByBooking(bookingId: number): Promise<Feedback | undefined> {
    return Array.from(this.feedbacks.values()).find(f => f.bookingId === bookingId);
  }

  async getFeedbacksByDoctor(doctorId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).filter(f => f.doctorId === doctorId);
  }

  async getDoctorAverageRating(doctorId: number): Promise<{ averageRating: number; totalFeedbacks: number }> {
    const doctorFeedbacks = await this.getFeedbacksByDoctor(doctorId);
    
    if (doctorFeedbacks.length === 0) {
      return { averageRating: 0, totalFeedbacks: 0 };
    }

    const totalRating = doctorFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = Math.round((totalRating / doctorFeedbacks.length) * 10) / 10; // Round to 1 decimal

    return { averageRating, totalFeedbacks: doctorFeedbacks.length };
  }
}

export const storage = new MemStorage();
