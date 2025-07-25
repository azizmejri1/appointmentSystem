import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { Notification } from './notification.schema';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('appointment-created')
  async notifyDoctorOfNewAppointment(
    @Body() body: { doctorId: string; patientId: string; appointmentId: string; appointmentTime: Date }
  ) {
    return this.notificationService.notifyDoctorOfNewAppointment(
      body.doctorId,
      body.patientId,
      body.appointmentId,
      body.appointmentTime
    );
  }

  @Post('appointment-reminder')
  async sendAppointmentReminder(
    @Body() body: { userId: string; appointmentId: string; appointmentTime: Date; userType: 'doctor' | 'patient' }
  ) {
    return this.notificationService.sendAppointmentReminder(
      body.userId,
      body.appointmentId,
      body.appointmentTime,
      body.userType
    );
  }

  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(userId, limit, offset);
  }

  @Post('mark-read/:notificationId')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  @Get('unread-count/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Post('check-upcoming-appointments')
  async checkUpcomingAppointments() {
    return this.notificationService.checkAndNotifyUpcomingAppointments();
  }

  // Test endpoint to manually create a notification
  @Post('test-notification')
  async createTestNotification(@Body() body: { userId: string; message: string }) {
    try {
      const notification = {
        message: body.message || 'Test notification',
        time: new Date(),
        user: body.userId,
        type: 'general',
        isRead: false,
      };

      const created = new (this.notificationService as any).notificationModel(notification);
      await created.save();

      return {
        success: true,
        message: 'Test notification created',
        notification: created,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Test endpoint to manually check and send appointment reminders
  @Post('test-reminders')
  async testReminders() {
    try {
      console.log('🧪 Manually triggering appointment reminder check...');
      const result = await this.notificationService.checkAndNotifyUpcomingAppointments();
      return {
        success: true,
        message: 'Manual reminder check completed',
        result: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Test endpoint to create a reminder for a specific user
  @Post('test-user-reminder')
  async testUserReminder(@Body() body: { userId: string; appointmentId?: string }) {
    try {
      const futureTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      
      const result = await this.notificationService.sendAppointmentReminder(
        body.userId,
        body.appointmentId || 'test-appointment-id',
        futureTime,
        'patient'
      );
      
      return {
        success: true,
        message: 'Test reminder created',
        result: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
