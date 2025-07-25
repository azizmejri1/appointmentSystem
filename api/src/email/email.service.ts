import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Validate required environment variables
    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_HOST environment variable is required');
    }
    if (!process.env.SMTP_USER) {
      throw new Error('SMTP_USER environment variable is required');
    }
    if (!process.env.SMTP_PASSWORD) {
      throw new Error('SMTP_PASSWORD environment variable is required');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug in development
      logger: process.env.NODE_ENV === 'development', // Enable logging in development
    });

    // Test connection on startup
    this.testConnection();
  }

  // Helper method to get the from email address
  private getFromEmail(): string {
    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM environment variable is required');
    }
    return `"${process.env.EMAIL_FROM_NAME || 'MedSchedule Team'}" <${process.env.EMAIL_FROM}>`;
  }

  // Helper method to get reply-to email address
  private getReplyToEmail(): string {
    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM environment variable is required');
    }
    return process.env.EMAIL_FROM;
  }

  // Generate a 6-digit verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async testConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection successful');
    } catch (error) {
      console.error('❌ SMTP connection failed:', error.message);
    }
  }

  async sendVerificationEmail(email: string, verificationCode: string, doctorName: string): Promise<void> {
    const mailOptions = {
      from: this.getFromEmail(),
      to: email,
      subject: '🏥 Your MedSchedule Verification Code',
      replyTo: this.getReplyToEmail(),
      text: `
Hello Dr. ${doctorName},

Thank you for registering with MedSchedule!

Your verification code is: ${verificationCode}

This code will expire in 10 minutes for security reasons.
Please enter it in the verification popup on the website.

If you didn't create this account, please ignore this email.

Best regards,
The MedSchedule Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification Code</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .code-box { background-color: #f8f9fa; border: 2px solid #3B82F6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
            .verification-code { font-size: 32px; font-weight: bold; color: #3B82F6; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MedSchedule</h1>
              <h2>Email Verification Code</h2>
            </div>
            
            <h3>Hello Dr. ${doctorName},</h3>
            
            <p>Thank you for registering with MedSchedule! To complete your account setup and start managing your appointments, please verify your email address using the code below.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Your verification code is:</p>
              <div class="verification-code">${verificationCode}</div>
            </div>
            
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important:</strong> This verification code will expire in 10 minutes for security reasons. Please enter it in the verification popup on the website.</p>
            </div>
            
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

  async sendPatientVerificationEmail(email: string, verificationCode: string, patientName: string): Promise<void> {
    const mailOptions = {
      from: this.getFromEmail(),
      to: email,
      subject: '🏥 Your MedSchedule Verification Code',
      replyTo: this.getReplyToEmail(),
      text: `
Hello ${patientName},

Thank you for registering with MedSchedule!

Your verification code is: ${verificationCode}

This code will expire in 10 minutes for security reasons.
Please enter it in the verification popup on the website.

If you didn't create this account, please ignore this email.

Best regards,
The MedSchedule Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification Code</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .code-box { background-color: #f8f9fa; border: 2px solid #3B82F6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
            .verification-code { font-size: 32px; font-weight: bold; color: #3B82F6; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 MedSchedule</h1>
              <h2>Email Verification Code</h2>
            </div>
            
            <h3>Hello ${patientName},</h3>
            
            <p>Thank you for registering with MedSchedule! To complete your account setup and start booking appointments, please verify your email address using the code below.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Your verification code is:</p>
              <div class="verification-code">${verificationCode}</div>
            </div>
            
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important:</strong> This verification code will expire in 10 minutes for security reasons. Please enter it in the verification popup on the website.</p>
            </div>
            
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
      console.log(`✅ Patient verification email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending patient verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, doctorName: string): Promise<void> {
    const mailOptions = {
      from: this.getFromEmail(),
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
              <a href="${process.env.FRONTEND_URL}/doctor/dashboard" class="button">Access Your Dashboard</a>
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

  // Test method to send a simple email
  async sendTestEmail(email: string): Promise<void> {
    const mailOptions = {
      from: this.getFromEmail(),
      to: email,
      subject: '✅ MedSchedule Test Email',
      replyTo: this.getReplyToEmail(),
      text: `
Hello!

This is a test email from MedSchedule to verify email delivery.

If you receive this email, the email system is working correctly.

Best regards,
The MedSchedule Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px;">
            <h1 style="color: #3B82F6;">✅ Test Email Successful!</h1>
            <p>Hello!</p>
            <p>This is a test email from MedSchedule to verify email delivery.</p>
            <p><strong>If you receive this email, the email system is working correctly.</strong></p>
            <p>Best regards,<br>The MedSchedule Team</p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Test email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending test email:', error);
      throw new Error('Failed to send test email');
    }
  }
}
