import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Schedule, ScheduleSchema } from 'src/schedule/schedule.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema },
    { name: Schedule.name, schema: ScheduleSchema },])],
  exports: [MongooseModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
