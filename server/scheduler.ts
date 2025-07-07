import cron from 'node-cron';
import { storage } from './storage';
import { sendReminderEmails, sendSMSReminder } from './notifications';

// Run every hour to check for bookings needing 24h reminders
const startReminderScheduler = () => {
  console.log('📅 Starting reminder scheduler - checking every hour for upcoming appointments');
  
  cron.schedule('0 * * * *', async () => {
    console.log('🔍 Checking for bookings needing 24h reminders...');
    
    try {
      const bookingsNeedingReminders = await storage.getBookingsNeedingReminders();
      
      if (bookingsNeedingReminders.length === 0) {
        console.log('✅ No bookings need reminders at this time');
        return;
      }
      
      console.log(`📧 Found ${bookingsNeedingReminders.length} booking(s) needing reminders`);
      
      for (const booking of bookingsNeedingReminders) {
        try {
          // Get doctor and patient details
          const doctor = await storage.getDoctorProfile(booking.doctorId);
          const patient = await storage.getUser(booking.patientId);
          
          if (!doctor || !patient) {
            console.error(`❌ Missing doctor or patient data for booking #${booking.id}`);
            continue;
          }
          
          const details = { booking, doctor, patient };
          
          // Send email reminders
          await sendReminderEmails(details);
          
          // Send SMS reminder if phone number is available
          if (booking.patientPhone) {
            await sendSMSReminder(details, booking.patientPhone);
          }
          
          // Mark reminders as sent
          await storage.markRemindersSent(booking.id);
          
          console.log(`✅ Reminders sent for booking #${booking.id}`);
          
        } catch (reminderError) {
          console.error(`❌ Error sending reminders for booking #${booking.id}:`, reminderError);
          // Continue with other bookings even if one fails
        }
      }
      
    } catch (error) {
      console.error('❌ Error in reminder scheduler:', error);
    }
  });
};

export { startReminderScheduler };