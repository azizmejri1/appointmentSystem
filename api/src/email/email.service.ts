import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'medschedule@zohomail.com',
        pass: 'Aziz@2003', // Use app password from environment
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: true, // Enable debug for troubleshooting
      logger: true, // Enable logging
    });

    // Test connection on startup
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection successful');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
    }
  }

  async sendVerificationEmail(email: string, token: string, doctorName: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: 'medschedule@zohomail.com',
      to: email,
      subject: 'Email Verification - MedSchedule',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .button { background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MedSchedule</h1>
              <h2>Email Verification Required</h2>
            </div>
            
            <h3>Hello Dr. ${doctorName},</h3>
            
            <p>Thank you for registering with MedSchedule! To complete your account setup and start managing your appointments, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p><strong>This verification link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The MedSchedule Team</p>
              <p>© 2025 MedSchedule. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, doctorName: string): Promise<void> {
    const mailOptions = {
      from: 'medschedule@zohomail.com',
      to: email,
      subject: 'Welcome to MedSchedule! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MedSchedule</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .button { background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .feature { background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3B82F6; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Welcome to MedSchedule!</h1>
              <h2>Your account is now verified</h2>
            </div>
            
            <h3>Congratulations Dr. ${doctorName}! 🎉</h3>
            
            <p>Your email has been successfully verified and your MedSchedule account is now active. You can start managing your appointments and connecting with patients right away.</p>
            
            <h4>What you can do now:</h4>
            
            <div class="feature">
              <strong>📅 Schedule Management</strong><br>
              Create and manage your availability, set appointment slots, and organize your calendar.
            </div>
            
            <div class="feature">
              <strong>👥 Patient Management</strong><br>
              View patient profiles, manage appointment requests, and maintain patient records.
            </div>
            
            <div class="feature">
              <strong>🔔 Notifications</strong><br>
              Get real-time notifications for new appointments, cancellations, and updates.
            </div>
            
            <div class="feature">
              <strong>📊 Analytics</strong><br>
              Track your appointment statistics and monitor your practice performance.
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/doctor/dashboard" class="button">Access Your Dashboard</a>
            </div>
            
            <p>If you have any questions or need assistance, feel free to contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The MedSchedule Team</p>
              <p>© 2025 MedSchedule. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}
