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
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      gender: data.gender,
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
    const doctor = await this.doctorModel.findById(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    Object.assign(doctor, data);
    await doctor.save();

    return {
      message: 'Doctor updated successfully',
      data: doctor,
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
}
