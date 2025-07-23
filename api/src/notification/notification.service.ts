import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './notification.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel('Appointment') private appointmentModel: Model<any>,
    @InjectModel('Doctor') private doctorModel: Model<any>,
    @InjectModel('Patient') private patientModel: Model<any>,
    @InjectModel('User') private userModel: Model<any>
  ) {}

  async notifyDoctorOfNewAppointment(
    doctorId: string,
    patientId: string,
    appointmentId: string,
    appointmentTime: Date
  ) {
    try {
      console.log('🔔 Creating notification for new appointment:', {
        doctorId,
        patientId,
        appointmentId,
        appointmentTime
      });

      // Get patient information
      const patient = await this.patientModel.findById(patientId).populate('user');
      console.log('👤 Patient found:', patient ? `${patient.user?.firstName} ${patient.user?.lastName}` : 'Not found');
      const patientName = patient ? `${patient.user?.firstName} ${patient.user?.lastName}` : 'Unknown Patient';
      
      // Get doctor's user ID
      const doctor = await this.doctorModel.findById(doctorId).populate('user');
      console.log('👨‍⚕️ Doctor found:', doctor ? `${doctor.user?.firstName} ${doctor.user?.lastName}` : 'Not found');
      
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      if (!doctor.user) {
        throw new Error('Doctor user reference not found');
      }

      const message = `New appointment scheduled with ${patientName} on ${this.formatDate(appointmentTime)}`;
      console.log('📝 Notification message:', message);

      const notification = new this.notificationModel({
        message,
        time: new Date(),
        user: doctor.user._id, // MongoDB will handle ObjectId conversion
        type: 'appointment_created',
        relatedId: appointmentId,
        isRead: false,
      });

      const savedNotification = await notification.save();
      console.log('✅ Notification saved successfully:', savedNotification._id);
      console.log('📋 Notification saved for user ID:', doctor.user._id.toString());
      console.log('🔍 Stored user field type:', typeof savedNotification.user);
      console.log('🔍 Stored user field value:', savedNotification.user);
      
      return {
        success: true,
        message: 'Doctor notified of new appointment',
        notification: savedNotification,
      };
    } catch (error) {
      console.error('❌ Error notifying doctor of new appointment:', error);
      throw error;
    }
  }

  async sendAppointmentReminder(
    userId: string,
    appointmentId: string,
    appointmentTime: Date,
    userType: 'doctor' | 'patient'
  ) {
    try {
      const timeUntil = this.getTimeUntilAppointment(appointmentTime);
      const message = `Reminder: You have an appointment in ${timeUntil} minutes`;

      const notification = new this.notificationModel({
        message,
        time: new Date(),
        user: userId,
        type: 'appointment_reminder',
        relatedId: appointmentId,
        isRead: false,
      });

      await notification.save();

      return {
        success: true,
        message: 'Appointment reminder sent',
        notification,
      };
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    console.log('🔍 Fetching notifications for user ID:', userId, 'limit:', limit, 'offset:', offset);
    console.log('🔍 UserID type:', typeof userId);
    
    try {
      // Convert string userId to ObjectId for proper MongoDB querying
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);
      
      console.log('🔄 Converted to ObjectId:', userObjectId);
      
      const notifications = await this.notificationModel
        .find({ user: userObjectId })  // Use ObjectId instead of string
        .sort({ time: -1 })
        .limit(limit)
        .skip(offset)
        .exec();
      
      console.log('📦 Found notifications:', notifications.length);
      console.log('📋 Notification details:', notifications.map(n => ({
        id: n._id,
        message: n.message.substring(0, 50) + '...',
        user: n.user,
        userType: typeof n.user,
        type: n.type,
        isRead: n.isRead
      })));
      
      return notifications;
    } catch (error) {
      console.error('❌ Error in getUserNotifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      return {
        success: true,
        message: 'Notification marked as read',
        notification,
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string) {
    try {
      // Convert string userId to ObjectId for proper MongoDB querying
      const { Types } = require('mongoose');
      const userObjectId = new Types.ObjectId(userId);
      
      const count = await this.notificationModel.countDocuments({
        user: userObjectId,  // Use ObjectId instead of string
        isRead: false,
      });

      return {
        success: true,
        unreadCount: count,
      };
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // This method runs every minute to check for upcoming appointments
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndNotifyUpcomingAppointments() {
    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      // Find appointments that are starting within the next 5 minutes
      const upcomingAppointments = await this.appointmentModel
        .find({
          appointmentDate: {
            $gte: now,
            $lte: fiveMinutesFromNow,
          },
          status: 'confirmed', // Only notify for confirmed appointments
        })
        .populate('doctor')
        .populate('patient')
        .exec();

      for (const appointment of upcomingAppointments) {
        // Check if we've already sent a reminder for this appointment
        const existingReminder = await this.notificationModel.findOne({
          relatedId: appointment._id,
          type: 'appointment_reminder',
        });

        if (!existingReminder) {
          // Send reminder to doctor
          if (appointment.doctor && appointment.doctor.user) {
            await this.sendAppointmentReminder(
              appointment.doctor.user,
              appointment._id,
              appointment.appointmentDate,
              'doctor'
            );
          }

          // Send reminder to patient
          if (appointment.patient && appointment.patient.user) {
            await this.sendAppointmentReminder(
              appointment.patient.user,
              appointment._id,
              appointment.appointmentDate,
              'patient'
            );
          }
        }
      }

      return {
        success: true,
        message: `Checked ${upcomingAppointments.length} upcoming appointments`,
        notificationsSent: upcomingAppointments.length * 2, // Doctor + Patient for each appointment
      };
    } catch (error) {
      console.error('Error checking upcoming appointments:', error);
      throw error;
    }
  }

  // Helper method to format date
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  // Helper method to calculate time until appointment
  private getTimeUntilAppointment(appointmentTime: Date): number {
    const now = new Date();
    const timeDiff = new Date(appointmentTime).getTime() - now.getTime();
    return Math.round(timeDiff / (1000 * 60)); // Convert to minutes
  }

  // Method to manually trigger upcoming appointment checks (for testing)
  async triggerUpcomingAppointmentCheck() {
    return this.checkAndNotifyUpcomingAppointments();
  }

  // Clean up old notifications (run daily)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.notificationModel.deleteMany({
        time: { $lt: thirtyDaysAgo },
        isRead: true,
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      
      return {
        success: true,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}
