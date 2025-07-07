/**
 * HerHealth Hub Notification System
 * 
 * Features:
 * - Email notifications via Resend API for booking confirmations and 24h reminders
 * - SMS notifications via Twilio for 24h appointment reminders (optional phone number)
 * - Automated cron scheduler runs every hour to check for upcoming appointments
 * - Professional email templates with meeting links and appointment details
 * - Graceful handling of missing API keys with console logging
 * 
 * Configuration:
 * - RESEND_API_KEY: Required for email notifications
 * - TWILIO_ACCOUNT_SID: Required for SMS notifications  
 * - TWILIO_AUTH_TOKEN: Required for SMS notifications
 * - TWILIO_PHONE_NUMBER: Required for SMS notifications
 * 
 * Usage:
 * - sendBookingConfirmation(): Triggered automatically when payment succeeds
 * - sendReminderEmails(): Triggered by cron scheduler 24h before appointments
 * - sendSMSReminder(): Triggered by cron scheduler if phone number provided
 */

import { Resend } from 'resend';
import twilio from 'twilio';
import type { Booking, DoctorProfile, User } from '@shared/schema';

// Initialize services
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

interface BookingDetails {
  booking: Booking;
  doctor: DoctorProfile;
  patient: User;
}

// Generate meeting URL placeholder (in production, integrate with Zoom/Teams API)
function generateMeetingUrl(bookingId: number): string {
  return `https://zoom.us/j/placeholder-${bookingId}`;
}

// Format date and time for display
function formatDateTime(date: string, time: string): { date: string; time: string } {
  const bookingDate = new Date(date);
  const formattedDate = bookingDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return { date: formattedDate, time };
}

// Email Templates
function getBookingConfirmationEmail(details: BookingDetails, isDoctor: boolean) {
  const { booking, doctor, patient } = details;
  const meetingUrl = generateMeetingUrl(booking.id);
  const { date, time } = formatDateTime(booking.appointmentDate.toString(), booking.appointmentTime);
  
  const subject = isDoctor 
    ? `New Booking: ${patient.firstName} ${patient.lastName} - ${date} at ${time}`
    : `Booking Confirmed: Dr. ${doctor.qualifications} - ${date} at ${time}`;

  const recipientName = isDoctor ? 'Doctor' : `${patient.firstName}`;
  const otherParty = isDoctor ? `${patient.firstName} ${patient.lastName}` : `your doctor`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">HerHealth Hub - Booking ${isDoctor ? 'Notification' : 'Confirmation'}</h2>
      
      <p>Dear ${recipientName},</p>
      
      <p>${isDoctor ? 'You have a new booking' : 'Your consultation has been confirmed'} with ${otherParty}.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0891b2;">Appointment Details</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Duration:</strong> 20 minutes</p>
        ${!isDoctor ? `<p><strong>Reason:</strong> ${booking.reasonForConsultation}</p>` : ''}
        <p><strong>Meeting Link:</strong> <a href="${meetingUrl}" style="color: #0891b2;">${meetingUrl}</a></p>
      </div>

      <div style="background: #fef2f2; border: 2px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #dc2626; font-weight: bold;">Important: HerHealth Hub is not an emergency service.<br>
        For urgent or life-threatening issues, call 999 or go to A&E.<br>
        The clinician you have booked is solely responsible for the medical advice provided during your consultation.</p>
      </div>
      
      <p>${isDoctor ? 'Please be available 5 minutes before the scheduled time.' : 'We will send you a reminder 24 hours before your appointment.'}</p>
      
      <p>If you need to reschedule or have any questions, please contact us at support@herhealth.com</p>
      
      <p>Best regards,<br>The HerHealth Hub Team</p>
    </div>
  `;

  return { subject, html };
}

function getReminderEmail(details: BookingDetails, isDoctor: boolean) {
  const { booking, doctor, patient } = details;
  const meetingUrl = generateMeetingUrl(booking.id);
  const { date, time } = formatDateTime(booking.appointmentDate.toString(), booking.appointmentTime);
  
  const subject = `Reminder: Your consultation ${isDoctor ? 'with ' + patient.firstName : 'tomorrow'} at ${time}`;
  const recipientName = isDoctor ? 'Doctor' : `${patient.firstName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">HerHealth Hub - Appointment Reminder</h2>
      
      <p>Dear ${recipientName},</p>
      
      <p>This is a reminder that you have a consultation scheduled for tomorrow.</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #d97706;">Tomorrow's Appointment</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Meeting Link:</strong> <a href="${meetingUrl}" style="color: #0891b2;">${meetingUrl}</a></p>
      </div>
      
      <p>Please join the meeting 5 minutes before the scheduled time to ensure a smooth start.</p>
      
      <p>If you need to reschedule, please contact us as soon as possible at support@herhealth.com</p>
      
      <p>Best regards,<br>The HerHealth Hub Team</p>
    </div>
  `;

  return { subject, html };
}

// Send booking confirmation emails
export async function sendBookingConfirmation(details: BookingDetails): Promise<void> {
  if (!resend) {
    console.log('⚠️  Resend not configured - skipping booking confirmation emails');
    return;
  }

  const { booking, doctor, patient } = details;

  try {
    // Send to patient
    const patientEmail = getBookingConfirmationEmail(details, false);
    await resend.emails.send({
      from: 'HerHealth Hub <bookings@herhealth.com>',
      to: [patient.email],
      subject: patientEmail.subject,
      html: patientEmail.html,
    });
    console.log(`✅ Booking confirmation email sent to patient: ${patient.email}`);

    // Send to doctor (assuming doctor has email from user record)
    const doctorUser = patient; // In real app, fetch doctor's user record
    const doctorEmail = getBookingConfirmationEmail(details, true);
    await resend.emails.send({
      from: 'HerHealth Hub <bookings@herhealth.com>',
      to: ['doctor@example.com'], // In real app, use doctor's email
      subject: doctorEmail.subject,
      html: doctorEmail.html,
    });
    console.log(`✅ Booking notification email sent to doctor for booking #${booking.id}`);

  } catch (error) {
    console.error('❌ Error sending booking confirmation emails:', error);
  }
}

// Send reminder emails
export async function sendReminderEmails(details: BookingDetails): Promise<void> {
  if (!resend) {
    console.log('⚠️  Resend not configured - skipping reminder emails');
    return;
  }

  const { booking, patient } = details;

  try {
    // Send reminder to patient
    const patientReminder = getReminderEmail(details, false);
    await resend.emails.send({
      from: 'HerHealth Hub <reminders@herhealth.com>',
      to: [patient.email],
      subject: patientReminder.subject,
      html: patientReminder.html,
    });
    console.log(`✅ Reminder email sent to patient: ${patient.email} for booking #${booking.id}`);

    // Send reminder to doctor
    const doctorReminder = getReminderEmail(details, true);
    await resend.emails.send({
      from: 'HerHealth Hub <reminders@herhealth.com>',
      to: ['doctor@example.com'], // In real app, use doctor's email
      subject: doctorReminder.subject,
      html: doctorReminder.html,
    });
    console.log(`✅ Reminder email sent to doctor for booking #${booking.id}`);

  } catch (error) {
    console.error('❌ Error sending reminder emails:', error);
  }
}

// Send reschedule confirmation emails
export async function sendRescheduleConfirmation(details: BookingDetails, oldDateTime: { date: string; time: string }): Promise<void> {
  if (!resend) {
    console.log('⚠️  Resend not configured - skipping reschedule confirmation emails');
    return;
  }

  const { booking, doctor, patient } = details;
  const meetingUrl = generateMeetingUrl(booking.id);
  const { date: newDate, time: newTime } = formatDateTime(booking.appointmentDate.toString(), booking.appointmentTime);

  try {
    // Send to patient
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">HerHealth Hub - Appointment Rescheduled</h2>
        
        <p>Dear ${patient.firstName},</p>
        
        <p>Your appointment has been successfully rescheduled.</p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin-top: 0; color: #d97706;">Previous Appointment</h4>
          <p><strong>Date:</strong> ${oldDateTime.date}</p>
          <p><strong>Time:</strong> ${oldDateTime.time}</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0891b2;">New Appointment Details</h3>
          <p><strong>Date:</strong> ${newDate}</p>
          <p><strong>Time:</strong> ${newTime}</p>
          <p><strong>Duration:</strong> 30 minutes</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingUrl}" style="color: #0891b2;">${meetingUrl}</a></p>
        </div>
        
        <p>We will send you a reminder 24 hours before your new appointment time.</p>
        
        <p>If you need to make any further changes, please contact us at support@herhealth.com</p>
        
        <p>Best regards,<br>The HerHealth Hub Team</p>
      </div>
    `;

    await resend.emails.send({
      from: 'HerHealth Hub <bookings@herhealth.com>',
      to: [patient.email],
      subject: `Appointment Rescheduled - ${newDate} at ${newTime}`,
      html: patientHtml,
    });
    console.log(`✅ Reschedule confirmation email sent to patient: ${patient.email}`);

    // Send to doctor
    const doctorHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">HerHealth Hub - Appointment Rescheduled</h2>
        
        <p>Dear Doctor,</p>
        
        <p>A patient has rescheduled their appointment with you.</p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin-top: 0; color: #d97706;">Previous Appointment</h4>
          <p><strong>Date:</strong> ${oldDateTime.date}</p>
          <p><strong>Time:</strong> ${oldDateTime.time}</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0891b2;">New Appointment Details</h3>
          <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
          <p><strong>Date:</strong> ${newDate}</p>
          <p><strong>Time:</strong> ${newTime}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingUrl}" style="color: #0891b2;">${meetingUrl}</a></p>
        </div>
        
        <p>Please update your schedule accordingly.</p>
        
        <p>Best regards,<br>The HerHealth Hub Team</p>
      </div>
    `;

    await resend.emails.send({
      from: 'HerHealth Hub <bookings@herhealth.com>',
      to: ['doctor@example.com'], // In real app, use doctor's email
      subject: `Patient Rescheduled: ${patient.firstName} ${patient.lastName} - ${newDate} at ${newTime}`,
      html: doctorHtml,
    });
    console.log(`✅ Reschedule notification email sent to doctor for booking #${booking.id}`);

  } catch (error) {
    console.error('❌ Error sending reschedule confirmation emails:', error);
  }
}

// Send cancellation confirmation emails
export async function sendCancellationConfirmation(details: BookingDetails): Promise<void> {
  if (!resend) {
    console.log('⚠️  Resend not configured - skipping cancellation confirmation emails');
    return;
  }

  const { booking, doctor, patient } = details;
  const { date, time } = formatDateTime(booking.appointmentDate.toString(), booking.appointmentTime);

  try {
    // Send to patient
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">HerHealth Hub - Appointment Cancelled</h2>
        
        <p>Dear ${patient.firstName},</p>
        
        <p>Your appointment has been successfully cancelled.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #dc2626;">Cancelled Appointment</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.qualifications}</p>
        </div>
        
        <p>Your payment will be refunded within 3-5 business days.</p>
        
        <p>If you need to book a new appointment, please visit our website or contact us at support@herhealth.com</p>
        
        <p>We hope to see you again soon.</p>
        
        <p>Best regards,<br>The HerHealth Hub Team</p>
      </div>
    `;

    await resend.emails.send({
      from: 'HerHealth Hub <bookings@herhealth.com>',
      to: [patient.email],
      subject: `Appointment Cancelled - ${date} at ${time}`,
      html: patientHtml,
    });
    console.log(`✅ Cancellation confirmation email sent to patient: ${patient.email}`);

    // Send to doctor
    const doctorHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">HerHealth Hub - Appointment Cancelled</h2>
        
        <p>Dear Doctor,</p>
        
        <p>A patient has cancelled their appointment with you.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #dc2626;">Cancelled Appointment</h3>
          <p><strong>Patient:</strong> ${patient.firstName} ${patient.lastName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
        
        <p>This time slot is now available for other patients to book.</p>
        
        <p>Best regards,<br>The HerHealth Hub Team</p>
      </div>
    `;

    await resend.emails.send({
      from: 'HerHealth Hub <bookings@herhealth.com>',
      to: ['doctor@example.com'], // In real app, use doctor's email
      subject: `Appointment Cancelled: ${patient.firstName} ${patient.lastName} - ${date} at ${time}`,
      html: doctorHtml,
    });
    console.log(`✅ Cancellation notification email sent to doctor for booking #${booking.id}`);

  } catch (error) {
    console.error('❌ Error sending cancellation confirmation emails:', error);
  }
}

// Send SMS reminder to patient
// Send post-consultation feedback email
export async function sendFeedbackRequest(details: BookingDetails): Promise<void> {
  if (!resend) {
    console.log('⚠️  Resend not configured - skipping feedback request email');
    return;
  }

  const { booking, doctor, patient } = details;
  const feedbackUrl = `${process.env.APP_URL || 'http://localhost:5000'}/feedback/${booking.id}`;
  const { date, time } = formatDateTime(booking.appointmentDate.toString(), booking.appointmentTime);

  try {
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">Thank you for choosing HerHealth Hub!</h2>
        
        <p>Dear ${patient.firstName},</p>
        
        <p>We hope your consultation was helpful and informative. Your feedback helps us improve our service and helps other women find the right specialist for their needs.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0891b2;">Your Recent Consultation</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.qualifications}</p>
          <p><strong>Specialty:</strong> ${doctor.specialty}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${feedbackUrl}" style="background-color: #0891b2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Share Your Experience
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          Your feedback is completely confidential and will be used to help other patients make informed decisions about their healthcare.
        </p>
        
        <p>If you have any concerns about your consultation, please don't hesitate to contact us at support@herhealth.com</p>
        
        <p>Best regards,<br>The HerHealth Hub Team</p>
      </div>
    `;

    await resend.emails.send({
      from: 'HerHealth Hub <feedback@herhealth.com>',
      to: [patient.email],
      subject: 'How was your consultation? Share your experience',
      html: patientHtml,
    });
    console.log(`✅ Feedback request email sent to patient: ${patient.email}`);

  } catch (error) {
    console.error('❌ Error sending feedback request email:', error);
  }
}

export async function sendSMSReminder(details: BookingDetails, phoneNumber?: string): Promise<void> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('⚠️  Twilio not configured - skipping SMS reminder');
    return;
  }

  if (!phoneNumber) {
    console.log('⚠️  No phone number provided - skipping SMS reminder');
    return;
  }

  const { booking, doctor } = details;
  const { date, time } = formatDateTime(booking.appointmentDate.toString(), booking.appointmentTime);
  const meetingUrl = generateMeetingUrl(booking.id);

  const message = `HerHealth Hub Reminder: Your consultation is tomorrow ${date} at ${time}. Meeting link: ${meetingUrl}. Join 5 minutes early. Reply STOP to opt out.`;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`✅ SMS reminder sent to ${phoneNumber} for booking #${booking.id}`);
  } catch (error) {
    console.error(`❌ Error sending SMS reminder to ${phoneNumber}:`, error);
  }
}