import { users, doctorProfiles, slots, bookings, doctorInvites, feedbacks, type User, type InsertUser, type DoctorProfile, type InsertDoctorProfile, type Slot, type InsertSlot, type Booking, type InsertBooking, type DoctorInvite, type InsertDoctorInvite, type Feedback, type InsertFeedback } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateMedicalHistoryUrl(userId: number, url: string): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | undefined>;

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
  updateBookingSymptoms(bookingId: number, symptomData: string, symptomSummary: string): Promise<Booking>;

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

  // Intake assessment operations
  storeIntakeAssessment(assessment: any): Promise<void>;
  getIntakeAssessment(id: number): Promise<any | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize database if needed
    this.init();
  }

  private async init() {
    // Check if we have doctors, if not seed them
    const doctorCount = await db.select({ count: sql<number>`count(*)` }).from(doctorProfiles);
    if (doctorCount[0].count === 0) {
      await this.seedDoctors();
    }
  }

  private async seedDoctors() {
    // Create sample doctors with passwords
    const doctor1 = await this.createUser({
      email: "sarah.johnson@herhealth.com",
      password: "password123", // In production, this would be properly hashed
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
      specialty: "Fertility & Reproductive Health",
      qualifications: "MBBS, MRCOG, MSc Reproductive Medicine",
      experience: "10 years in fertility and reproductive endocrinology",
      bio: "Dr. Sarah Johnson specializes in fertility treatments, IVF, and reproductive health for women planning families.",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      indemnityConfirmed: true,
    });

    const profile2 = await this.createDoctorProfile({
      userId: doctor2.id,
      specialty: "Menopause & Hormone Health",
      qualifications: "MBBS, FRCOG, Diploma in Menopause Care",
      experience: "15 years in menopause and hormone therapy",
      bio: "Dr. Emily Chen is an expert in menopause management, hormone replacement therapy, and supporting women through life transitions.",
      profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      indemnityConfirmed: true,
    });

    const profile3 = await this.createDoctorProfile({
      userId: doctor3.id,
      specialty: "Gynaecology",
      qualifications: "MBBS, FRCOG, Advanced Laparoscopic Surgery",
      experience: "12 years specializing in endometriosis and pelvic pain",
      bio: "Dr. Rebecca Martinez focuses on gynaecological conditions including endometriosis diagnosis, treatment, and surgical management.",
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      indemnityConfirmed: true,
    });

    // Add fourth doctor
    const doctor4 = await this.createUser({
      email: "olivia.wilson@herhealth.com",
      firstName: "Olivia",
      lastName: "Wilson",
      isDoctor: true,
    });

    const profile4 = await this.createDoctorProfile({
      userId: doctor4.id,
      specialty: "Women's Health",
      qualifications: "MBBS, MRCGP, Diploma Women's Health",
      experience: "8 years in comprehensive women's healthcare",
      bio: "Dr. Olivia Wilson provides holistic women's health care, from routine check-ups to complex health concerns.",
      profileImage: "https://images.unsplash.com/photo-1594824720379-e0aaf9cd4659?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      indemnityConfirmed: true,
    });

    // Create slots for next 7 days for each doctor
    const today = new Date();
    // Generate time slots every 15 minutes from 6 AM to 10 PM
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    
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
        
        await this.createSlot({
          doctorId: profile4.id,
          date: dateStr,
          time,
          isAvailable: true,
        });
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password if provided
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return undefined;

    return user;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateMedicalHistoryUrl(userId: number, url: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ medicalHistoryUrl: url })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    const [profile] = await db.select().from(doctorProfiles).where(eq(doctorProfiles.id, id));
    return profile;
  }

  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    const [profile] = await db.select().from(doctorProfiles).where(eq(doctorProfiles.userId, userId));
    return profile;
  }

  async getAllDoctorProfiles(): Promise<DoctorProfile[]> {
    return await db.select().from(doctorProfiles);
  }

  async createDoctorProfile(insertProfile: InsertDoctorProfile): Promise<DoctorProfile> {
    const [profile] = await db
      .insert(doctorProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateDoctorStripeAccount(doctorId: number, stripeAccountId: string): Promise<DoctorProfile> {
    const [profile] = await db
      .update(doctorProfiles)
      .set({ stripeAccountId })
      .where(eq(doctorProfiles.id, doctorId))
      .returning();
    if (!profile) throw new Error("Doctor profile not found");
    return profile;
  }

  async getSlot(id: number): Promise<Slot | undefined> {
    const [slot] = await db.select().from(slots).where(eq(slots.id, id));
    return slot;
  }

  async getSlotsByDoctor(doctorId: number): Promise<Slot[]> {
    return await db.select().from(slots).where(eq(slots.doctorId, doctorId));
  }

  async getAvailableSlots(doctorId: number): Promise<Slot[]> {
    return await db
      .select()
      .from(slots)
      .where(and(eq(slots.doctorId, doctorId), eq(slots.isAvailable, true)));
  }

  async createSlot(insertSlot: InsertSlot): Promise<Slot> {
    const [slot] = await db
      .insert(slots)
      .values(insertSlot)
      .returning();
    return slot;
  }

  async updateSlotAvailability(slotId: number, isAvailable: boolean): Promise<Slot> {
    const [slot] = await db
      .update(slots)
      .set({ isAvailable })
      .where(eq(slots.id, slotId))
      .returning();
    if (!slot) throw new Error("Slot not found");
    return slot;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByPatient(patientId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.patientId, patientId));
  }

  async getBookingsByDoctor(doctorId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.doctorId, doctorId));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    
    // Mark the slot as unavailable
    await this.updateSlotAvailability(insertBooking.slotId, false);
    
    return booking;
  }

  async updateBookingPayment(bookingId: number, paymentIntentId: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ paymentIntentId, status: "confirmed" })
      .where(eq(bookings.id, bookingId))
      .returning();
    if (!booking) throw new Error("Booking not found");
    return booking;
  }

  async updateBookingStatus(bookingId: number, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, bookingId))
      .returning();
    if (!booking) throw new Error("Booking not found");
    return booking;
  }

  // Doctor invite operations
  async createDoctorInvite(insertInvite: InsertDoctorInvite): Promise<DoctorInvite> {
    const [invite] = await db
      .insert(doctorInvites)
      .values(insertInvite)
      .returning();
    return invite;
  }

  async getDoctorInviteByToken(token: string): Promise<DoctorInvite | undefined> {
    const [invite] = await db
      .select()
      .from(doctorInvites)
      .where(
        and(
          eq(doctorInvites.token, token),
          eq(doctorInvites.isUsed, false),
          gte(doctorInvites.expiresAt, new Date())
        )
      );
    return invite;
  }

  async markInviteAsUsed(inviteId: number): Promise<DoctorInvite> {
    const [invite] = await db
      .update(doctorInvites)
      .set({ isUsed: true })
      .where(eq(doctorInvites.id, inviteId))
      .returning();
    if (!invite) throw new Error("Invite not found");
    return invite;
  }

  async cleanupExpiredInvites(): Promise<void> {
    await db
      .delete(doctorInvites)
      .where(sql`${doctorInvites.expiresAt} < now()`);
  }

  async markRemindersSent(bookingId: number): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ remindersSent: true })
      .where(eq(bookings.id, bookingId))
      .returning();
    if (!booking) throw new Error(`Booking with id ${bookingId} not found`);
    return booking;
  }

  async getBookingsNeedingReminders(): Promise<Booking[]> {
    const now = new Date();
    const twentyThreeHours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const twentyFiveHours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.remindersSent, false),
          eq(bookings.status, 'confirmed'),
          gte(bookings.appointmentDate, twentyThreeHours),
          sql`${bookings.appointmentDate} <= ${twentyFiveHours}`
        )
      );
  }

  async rescheduleBooking(bookingId: number, newSlotId: number): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
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
    
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        slotId: newSlotId,
        appointmentDate: newAppointmentDate,
        appointmentTime: newSlot.time,
        remindersSent: false, // Reset reminder status for new appointment time
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return updatedBooking;
  }

  async cancelBooking(bookingId: number): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
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
    const [cancelledBooking] = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, bookingId))
      .returning();
      
    return cancelledBooking;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db
      .insert(feedbacks)
      .values(insertFeedback)
      .returning();
    return feedback;
  }

  async getFeedback(id: number): Promise<Feedback | undefined> {
    const [feedback] = await db.select().from(feedbacks).where(eq(feedbacks.id, id));
    return feedback;
  }

  async getFeedbackByBooking(bookingId: number): Promise<Feedback | undefined> {
    const [feedback] = await db.select().from(feedbacks).where(eq(feedbacks.bookingId, bookingId));
    return feedback;
  }

  async getFeedbacksByDoctor(doctorId: number): Promise<Feedback[]> {
    return await db.select().from(feedbacks).where(eq(feedbacks.doctorId, doctorId));
  }

  async updateBookingSymptoms(bookingId: number, symptomData: string, symptomSummary: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ symptomData, symptomSummary })
      .where(eq(bookings.id, bookingId))
      .returning();
    if (!booking) throw new Error("Booking not found");
    return booking;
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

  async storeIntakeAssessment(assessment: any): Promise<void> {
    // Store intake assessment in bookings table using intakeId field
    await db
      .update(bookings)
      .set({ intakeId: assessment.id.toString() })
      .where(eq(bookings.id, assessment.bookingId));
  }

  async getIntakeAssessment(id: string): Promise<any | undefined> {
    // Retrieve intake assessment by intakeId from bookings
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.intakeId, id));
    return booking ? { id, bookingId: booking.id } : undefined;
  }
}

export const storage = new DatabaseStorage();
