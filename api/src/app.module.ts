import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { ConfigModule } from '@nestjs/config';
import { RecordModule } from './record/record.module';
import { AppointmentModule } from './appointment/appointment.module';
import { WaitingListModule } from './waiting-list/waiting-list.module';
import { NotificationModule } from './notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { EmailModule } from './email/email.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    EmailModule,
    UserModule,
    DoctorModule,
    PatientModule,
    RecordModule,
    AppointmentModule,
    WaitingListModule,
    NotificationModule,
    AuthModule,
    ScheduleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
