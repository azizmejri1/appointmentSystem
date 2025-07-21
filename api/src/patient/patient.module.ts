import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './patient.schema';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { User, UserSchema } from 'src/user/user.schema';
import { Appointment, AppointmentSchema } from 'src/appointment/appointment.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Patient.name, schema: PatientSchema },
    { name: User.name, schema: UserSchema },
    { name: Appointment.name, schema: AppointmentSchema },
  ])],
  exports: [MongooseModule],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
