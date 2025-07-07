import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isDoctor: boolean("is_doctor").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  medicalHistoryUrl: text("medical_history_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specialty: text("specialty").notNull(),
  qualifications: text("qualifications").notNull(),
  experience: text("experience").notNull(),
  rating: text("rating").default("4.9"),
  reviewCount: integer("review_count").default(0),
  bio: text("bio"),
  availability: text("availability").default("Available today"),
  stripeAccountId: text("stripe_account_id"),
  profileImage: text("profile_image"),
  indemnityConfirmed: boolean("indemnity_confirmed").default(false).notNull(),
});

export const slots = pgTable("slots", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctorProfiles.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctorProfiles.id).notNull(),
  slotId: integer("slot_id").references(() => slots.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  reasonForConsultation: text("reason_for_consultation"),
  patientPhone: text("patient_phone"), // Optional phone number for SMS reminders
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled, rescheduled
  paymentIntentId: text("payment_intent_id"),
  meetingUrl: text("meeting_url"),
  remindersSent: boolean("reminders_sent").default(false),
  symptomData: text("symptom_data"), // JSON string of questionnaire answers
  symptomSummary: text("symptom_summary"), // AI-generated clinical summary
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctorInvites = pgTable("doctor_invites", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  isDoctor: true,
});

export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).pick({
  userId: true,
  specialty: true,
  qualifications: true,
  experience: true,
  bio: true,
  profileImage: true,
  indemnityConfirmed: true,
});

export const insertSlotSchema = createInsertSchema(slots).pick({
  doctorId: true,
  date: true,
  time: true,
  isAvailable: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  patientId: true,
  doctorId: true,
  slotId: true,
  appointmentDate: true,
  appointmentTime: true,
  reasonForConsultation: true,
  patientPhone: true,
});

export const insertDoctorInviteSchema = createInsertSchema(doctorInvites).pick({
  email: true,
  token: true,
  expiresAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).pick({
  bookingId: true,
  doctorId: true,
  patientId: true,
  rating: true,
  comment: true,
  isAnonymous: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;
export type Slot = typeof slots.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type DoctorInvite = typeof doctorInvites.$inferSelect;
export type InsertDoctorInvite = z.infer<typeof insertDoctorInviteSchema>;
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
