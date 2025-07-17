import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Patient } from './patient.schema';
import { User } from '../user/user.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async signup(data: CreatePatientDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userModel.create({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      gender: data.gender,
    });

    const patient = await this.patientModel.create({
      user: user._id,
      
    });

    return {
      message: 'Patient created successfully',
      data: { userId: user._id, patientId: patient._id },
    };
  }

  async update(patientId: string, data: UpdatePatientDto) {
    const patient = await this.patientModel.findById(patientId);
    if (!patient) throw new NotFoundException('Patient not found');

    Object.assign(patient, data);
    await patient.save();

    return {
      message: 'Patient updated successfully',
      data: patient,
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
}
