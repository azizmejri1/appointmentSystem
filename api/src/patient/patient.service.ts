import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Patient } from './patient.schema';
import { User } from '../user/user.schema';
import { Appointment } from '../appointment/appointment.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
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

    const patient = await this.patientModel.create({
      user: user._id,
      
    });

    return {
      message: 'Patient created successfully',
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
}
