import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Doctor } from './doctor.schema';
import { User } from '../user/user.schema';
import { Appointment } from '../appointment/appointment.schema';
import { Patient } from '../patient/patient.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    private emailService: EmailService,
  ) {}

  async signup(data: CreateDoctorDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userModel.create({
      firstName: data.firstName,
      lastName : data.lastName,
      email: data.email,
      password: hashedPassword,
      gender: data.gender,
      phoneNumber : data.phoneNumber,
    });

    // Generate verification code (6 digits)
    const verificationCode = this.emailService.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const doctor = await this.doctorModel.create({
      user: user._id,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
        `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail the signup if email fails, just log it
    }

    return {
      message: 'Doctor created successfully. Please check your email for verification.',
      data: { userId: user._id, doctorId: doctor._id },
    };
  }

  async update(doctorId: string, data: UpdateDoctorDto) {
    const doctor = await this.doctorModel.findById(doctorId).populate('user');
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Extract user-related fields
    const { firstName, lastName, email, password, gender, phoneNumber, ...doctorData } = data;

    // Update user information if provided
    if (firstName || lastName || email || password || gender || phoneNumber) {
      const user = await this.userModel.findById(doctor.user);
      if (user) {
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (gender) user.gender = gender;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (password) {
          user.password = await bcrypt.hash(password, 10);
        }
        await user.save();
      }
    }

    // Update doctor information
    Object.assign(doctor, doctorData);
    await doctor.save();

    // Return populated doctor
    const updatedDoctor = await this.doctorModel
      .findById(doctorId)
      .populate({
        path: 'user',
        select: '-password'
      })
      .exec();

    return {
      message: 'Doctor updated successfully',
      data: updatedDoctor,
    };
  }

  async delete(doctorId: string) {
    const doctor = await this.doctorModel.findById(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    const userId = doctor.user;
    await this.doctorModel.deleteOne({ _id: doctorId });
    await this.userModel.deleteOne({ _id: userId });

    return { message: 'Doctor and associated user deleted' };
  }

  async searchDoctors(speciality?: string, city?: string): Promise<Doctor[]> {
    const query: any = {};

    if (speciality) {
      query.speciality = { $regex: new RegExp(speciality, 'i') }; // case-insensitive
    }

    if (city) {
      query.city = { $regex: new RegExp(city, 'i') }; // case-insensitive
    }

    return this.doctorModel
    .find(query)
    .populate({
      path: 'user',
      select: '-password' // exclude the password field
    })
    .exec();
  }

  async findAllDoctors(): Promise<Doctor[]> {
  return this.doctorModel
    .find({})
    .populate({
      path: 'user',
      select: '-password' // exclude password field
    })
    .exec();
}


  async getAvailableSpecialities(): Promise<string[]> {
    return this.doctorModel.distinct('speciality').exec();
  }

  async getAvailableCities(): Promise<string[]> {
    return this.doctorModel.distinct('city').exec();
  }

  async findOne(doctorId: string): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findById(doctorId)
      .populate({
        path: 'user',
        select: '-password'
      })
      .exec();
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    
    return doctor;
  }

  async uploadCredentials(doctorId: string, credentialImg: string) {
    const doctor = await this.doctorModel.findById(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    doctor.credential_img = credentialImg;
    await doctor.save();

    return {
      message: 'Credentials uploaded successfully',
      data: doctor,
    };
  }

  async verifyPhone(doctorId: string, phoneNumber: string) {
    const doctor = await this.doctorModel.findById(doctorId).populate('user');
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Update phone number in user record
    const user = await this.userModel.findById(doctor.user);
    if (user) {
      user.phoneNumber = phoneNumber;
      await user.save();
    }

    // Here you would implement actual phone verification logic
    // For now, we'll just return a success message
    return {
      message: 'Phone verification initiated',
      data: { phoneNumber },
    };
  }

  async verifyEmailWithCode(code: string, doctorId: string) {
    console.log('🔍 Doctor verification attempt:');
    console.log('- Doctor ID:', doctorId);
    console.log('- Code provided:', code);
    console.log('- Current time:', new Date());

    // First, let's find the doctor and see what codes exist
    const doctorCheck = await this.doctorModel.findById(doctorId);
    if (doctorCheck) {
      console.log('- Stored code:', doctorCheck.emailVerificationCode);
      console.log('- Code expiry:', doctorCheck.emailVerificationExpires);
      console.log('- Code match:', doctorCheck.emailVerificationCode === code);
      console.log('- Code not expired:', doctorCheck.emailVerificationExpires && doctorCheck.emailVerificationExpires > new Date());
      console.log('- Code type:', typeof doctorCheck.emailVerificationCode);
      console.log('- Provided code type:', typeof code);
      console.log('- Email verified status:', doctorCheck.emailVerified);
    } else {
      console.log('❌ Doctor not found with ID:', doctorId);
    }

    const doctor = await this.doctorModel.findOne({
      _id: doctorId,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: new Date() }
    }).populate('user');

    if (!doctor) {
      console.log('❌ Doctor verification failed - no matching record found');
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark email as verified
    doctor.emailVerified = true;
    doctor.emailVerificationCode = undefined;
    doctor.emailVerificationExpires = undefined;
    await doctor.save();

    // Send welcome email
    const user = doctor.user as any;
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the verification if welcome email fails
    }

    return {
      message: 'Email verified successfully! Welcome to MedSchedule.',
      data: {
        emailVerified: true,
        doctorId: doctor._id
      }
    };
  }

  // Keep the old method for backward compatibility but mark as deprecated
  async verifyEmail(token: string) {
    const doctor = await this.doctorModel.findOne({
      emailVerificationCode: token, // Updated to use code field for compatibility
      emailVerificationExpires: { $gt: new Date() }
    }).populate('user');

    if (!doctor) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified
    doctor.emailVerified = true;
    doctor.emailVerificationCode = undefined;
    doctor.emailVerificationExpires = undefined;
    await doctor.save();

    // Send welcome email
    const user = doctor.user as any;
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the verification if welcome email fails
    }

    return {
      message: 'Email verified successfully! Welcome to MedSchedule.',
      data: {
        doctorId: doctor._id,
        emailVerified: true,
      },
    };
  }

  async resendVerificationEmail(doctorId: string) {
    const doctor = await this.doctorModel.findById(doctorId).populate('user');
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (doctor.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification code
    const verificationCode = this.emailService.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    doctor.emailVerificationCode = verificationCode;
    doctor.emailVerificationExpires = verificationExpires;
    await doctor.save();

    const user = doctor.user as any;
    
    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
        `${user.firstName} ${user.lastName}`
      );

      return {
        message: 'Verification code sent successfully',
        data: { email: user.email },
      };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  async testEmail(email: string) {
    try {
      await this.emailService.sendTestEmail(email);
      return {
        success: true,
        message: 'Test email sent successfully',
      };
    } catch (error) {
      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }

  async getDoctorStatistics(doctorId: string) {
    try {
      // Get current date boundaries
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday.getTime() - (startOfToday.getDay() * 24 * 60 * 60 * 1000));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Total appointments
      const totalAppointments = await this.appointmentModel.countDocuments({ doctor: doctorId });

      // Appointments by status
      const appointmentsByStatus = await this.appointmentModel.aggregate([
        { $match: { doctor: doctorId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]);

      // Appointments this week
      const appointmentsThisWeek = await this.appointmentModel.countDocuments({
        doctor: doctorId,
        dateTime: { $gte: startOfWeek }
      });

      // Appointments this month
      const appointmentsThisMonth = await this.appointmentModel.countDocuments({
        doctor: doctorId,
        dateTime: { $gte: startOfMonth }
      });

      // Appointments today
      const appointmentsToday = await this.appointmentModel.countDocuments({
        doctor: doctorId,
        dateTime: {
          $gte: startOfToday,
          $lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      // Unique patients count
      const uniquePatients = await this.appointmentModel.distinct('patient', { doctor: doctorId });

      // Monthly appointments for the last 6 months
      const monthlyStats = await this.appointmentModel.aggregate([
        {
          $match: {
            doctor: doctorId,
            dateTime: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$dateTime' },
              month: { $month: '$dateTime' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Revenue calculation - remove since no real fee data
      // const revenueStats = [{
      //   totalRevenue: totalAppointments * 50, // Assumed base fee
      //   averageFee: 50
      // }];

      // Recent appointments
      const recentAppointments = await this.appointmentModel
        .find({ doctor: doctorId })
        .populate({
          path: 'patient',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        })
        .sort({ dateTime: -1 })
        .limit(5);

      return {
        overview: {
          totalAppointments,
          appointmentsToday,
          appointmentsThisWeek,
          appointmentsThisMonth,
          uniquePatients: uniquePatients.length
        },
        appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        monthlyTrends: monthlyStats.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          appointments: item.count
        })),
        recentAppointments
      };
    } catch (error) {
      console.error('Error fetching doctor statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  async getDoctorPerformanceMetrics(doctorId: string) {
    try {
      // Cancellation rate
      const totalAppointments = await this.appointmentModel.countDocuments({ doctor: doctorId });
      const cancelledAppointments = await this.appointmentModel.countDocuments({ 
        doctor: doctorId, 
        status: 'cancelled' 
      });

      // No-show rate
      const noShowAppointments = await this.appointmentModel.countDocuments({ 
        doctor: doctorId, 
        status: 'no-show' 
      });

      // Completion rate
      const completedAppointments = await this.appointmentModel.countDocuments({ 
        doctor: doctorId, 
        status: 'completed' 
      });

      return {
        cancellationRate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments * 100) : 0,
        noShowRate: totalAppointments > 0 ? (noShowAppointments / totalAppointments * 100) : 0,
        completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100) : 0,
        totalAppointments
      };
    } catch (error) {
      console.error('Error fetching doctor performance metrics:', error);
      throw new Error('Failed to fetch performance metrics');
    }
  }

}
