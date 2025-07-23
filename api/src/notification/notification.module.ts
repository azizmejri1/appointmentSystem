import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Appointment, AppointmentSchema } from '../appointment/appointment.schema';
import { Doctor, DoctorSchema } from '../doctor/doctor.schema';
import { Patient, PatientSchema } from '../patient/patient.schema';
import { User, UserSchema } from '../user/user.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
