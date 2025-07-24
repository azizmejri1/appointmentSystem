import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, DoctorSchema } from './doctor.schema';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { User, UserSchema } from 'src/user/user.schema';
import { Appointment, AppointmentSchema } from '../appointment/appointment.schema';
import { Patient, PatientSchema } from '../patient/patient.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema }
    ]),
    EmailModule,
  ],
  exports: [MongooseModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
