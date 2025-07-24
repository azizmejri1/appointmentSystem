import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Patient } from './patient.schema';
import { User } from '../user/user.schema';
import { Appointment } from '../appointment/appointment.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    private emailService: EmailService,
  ) {}

  async signup(data: CreatePatientDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      gender : data.gender,
    });

    // Generate email verification code
    const emailVerificationCode = this.emailService.generateVerificationCode();
    const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const patient = await this.patientModel.create({
      user: user._id,
      emailVerificationCode,
      emailVerificationExpiry,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    // Send verification email
    try {
      await this.emailService.sendPatientVerificationEmail(
        data.email,
        emailVerificationCode,
        `${data.firstName} ${data.lastName}`
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      message: 'Patient created successfully. Please check your email to verify your account.',
      data: { userId: user._id, patientId: patient._id },
    };
  }

  async findById(patientId: string) {
    const patient = await this.patientModel
      .findById(patientId)
      .populate('user', 'firstName lastName email phoneNumber gender')
      .exec();
    
    if (!patient) throw new NotFoundException('Patient not found');

    return {
      message: 'Patient found successfully',
      data: patient,
    };
  }

  async update(patientId: string, data: UpdatePatientDto) {
    const patient = await this.patientModel.findById(patientId).populate('user');
    if (!patient) throw new NotFoundException('Patient not found');

    // Update user information if provided
    const user = patient.user as any;
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.gender !== undefined) user.gender = data.gender;
    
    await user.save();

    // Reload patient with updated user data
    const updatedPatient = await this.patientModel
      .findById(patientId)
      .populate('user', 'firstName lastName email phoneNumber gender')
      .exec();

    return {
      message: 'Patient updated successfully',
      data: updatedPatient,
    };
  }

  async delete(patientId: string) {
    const patient = await this.patientModel.findById(patientId);
    if (!patient) throw new NotFoundException('Patient not found');

    const userId = patient.user;
    await this.patientModel.deleteOne({ _id: patientId });
    await this.userModel.deleteOne({ _id: userId });

    return { message: 'Patient and associated user deleted' };
  }

  async getPatientsByDoctor(doctorId: string) {
    // Get all appointments for the doctor
    const appointments = await this.appointmentModel
      .find({ doctor: doctorId })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phoneNumber gender'
        }
      })
      .exec();

    // Extract unique patients
    const patientMap = new Map();
    appointments.forEach(appointment => {
      if (appointment.patient && appointment.patient._id) {
        const patient = appointment.patient as any; // Type assertion for populated patient
        const patientId = patient._id.toString();
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            _id: patient._id,
            user: patient.user,
            // Add appointment count for this patient
            appointmentCount: 1,
            // Add last appointment date
            lastAppointment: appointment.dateTime
          });
        } else {
          // Update appointment count and last appointment if newer
          const existingPatient = patientMap.get(patientId);
          existingPatient.appointmentCount += 1;
          if (new Date(appointment.dateTime) > new Date(existingPatient.lastAppointment)) {
            existingPatient.lastAppointment = appointment.dateTime;
          }
        }
      }
    });

    const uniquePatients = Array.from(patientMap.values());

    return {
      message: 'Patients retrieved successfully',
      data: uniquePatients,
      total: uniquePatients.length
    };
  }

  async verifyEmailWithCode(code: string, patientId: string) {
    console.log('🔍 Patient verification attempt:');
    console.log('- Patient ID:', patientId);
    console.log('- Code provided:', code);
    console.log('- Current time:', new Date());

    // First, let's find the patient and see what codes exist
    const patientCheck = await this.patientModel.findById(patientId);
    if (patientCheck) {
      console.log('- Stored code:', patientCheck.emailVerificationCode);
      console.log('- Code expiry:', patientCheck.emailVerificationExpiry);
      console.log('- Code match:', patientCheck.emailVerificationCode === code);
      console.log('- Code not expired:', patientCheck.emailVerificationExpiry && patientCheck.emailVerificationExpiry > new Date());
      console.log('- Code type:', typeof patientCheck.emailVerificationCode);
      console.log('- Provided code type:', typeof code);
      console.log('- Email verified status:', patientCheck.isEmailVerified);
    } else {
      console.log('❌ Patient not found with ID:', patientId);
    }

    const patient = await this.patientModel.findOne({
      _id: patientId,
      emailVerificationCode: code,
      emailVerificationExpiry: { $gt: new Date() },
    }).populate('user');

    if (!patient) {
      console.log('❌ Patient verification failed - no matching record found');
      throw new NotFoundException('Invalid or expired verification code');
    }

    patient.isEmailVerified = true;
    patient.emailVerificationCode = undefined;
    patient.emailVerificationExpiry = undefined;
    await patient.save();

    // Send welcome email (placeholder - you can create a patient welcome email template)
    const user = patient.user as any;
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      message: 'Email verified successfully',
      data: { 
        isEmailVerified: true,
        patientId: patient._id
      },
    };
  }

  // Keep the old method for backward compatibility
  async verifyEmail(token: string) {
    const patient = await this.patientModel.findOne({
      emailVerificationCode: token, // Updated to use code field for compatibility
      emailVerificationExpiry: { $gt: new Date() },
    }).populate('user');

    if (!patient) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    patient.isEmailVerified = true;
    patient.emailVerificationCode = undefined;
    patient.emailVerificationExpiry = undefined;
    await patient.save();

    // Send welcome email
    const user = patient.user as any;
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      message: 'Email verified successfully',
      data: { isEmailVerified: true },
    };
  }

  async resendVerificationEmail(patientId: string) {
    const patient = await this.patientModel.findById(patientId).populate('user');
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.isEmailVerified) {
      return {
        message: 'Email is already verified',
        data: { isEmailVerified: true },
      };
    }

    // Generate new verification code
    const emailVerificationCode = this.emailService.generateVerificationCode();
    const emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    patient.emailVerificationCode = emailVerificationCode;
    patient.emailVerificationExpiry = emailVerificationExpiry;
    await patient.save();

    const user = patient.user as any;
    await this.emailService.sendPatientVerificationEmail(
      user.email,
      emailVerificationCode,
      `${user.firstName} ${user.lastName}`
    );

    return {
      message: 'Verification email sent successfully',
      data: { emailSent: true },
    };
  }

  async verifyPhone(patientId: string, phoneNumber: string) {
    const patient = await this.patientModel.findById(patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // In a real implementation, you would send SMS and verify the code
    // For now, we'll just mark as verified
    patient.isPhoneVerified = true;
    await patient.save();

    return {
      message: 'Phone number verified successfully',
      data: { isPhoneVerified: true },
    };
  }

  async getPatientAppointments(patientId: string) {
    const appointments = await this.appointmentModel
      .find({ patient: patientId })
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .sort({ dateTime: -1 })
      .exec();

    return {
      message: 'Appointments retrieved successfully',
      data: appointments,
      total: appointments.length
    };
  }
}
