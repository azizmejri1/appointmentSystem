import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Doctor } from './doctor.schema';
import { User } from '../user/user.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(User.name) private userModel: Model<User>,
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

    const doctor = await this.doctorModel.create({
      user: user._id,
    });

    return {
      message: 'Doctor created successfully',
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

  async verifyEmail(doctorId: string) {
    const doctor = await this.doctorModel.findById(doctorId).populate('user');
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Here you would implement actual email verification logic
    // For now, we'll just return a success message
    return {
      message: 'Email verification initiated',
      data: doctor,
    };
  }

}
