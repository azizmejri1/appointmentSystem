import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './appointment.schema';
import { Model } from 'mongoose';
import { CreateAppointmentDto } from './create-appointment.dto';
import * as moment from 'moment';
import { Schedule } from 'src/schedule/schedule.schema';
import { Patient } from 'src/patient/patient.schema';
import { User } from 'src/user/user.schema';
import { NotificationService } from '../notification/notification.service';


@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<Schedule>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<Patient>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async checkAvailability(dto: CreateAppointmentDto): Promise<{
    isAvailable: boolean;
    availableSlot?: any;
    availableDays: string[];
    canJoinWaitingList: boolean;
    requestedDate: string;
  }> {
    const requestedTime = moment(dto.dateTime);
    const fullDateString = requestedTime.format('dddd MMMM D');
    
    const schedule = await this.scheduleModel.findOne({ doctorId: dto.doctor });
    if (!schedule) {
      return {
        isAvailable: false,
        availableDays: [],
        canJoinWaitingList: false,
        requestedDate: fullDateString,
      };
    }

    const availableSlot = schedule.availability.find(
      (slot) => slot.day.trim().toLowerCase() === fullDateString.trim().toLowerCase()
    );

    return {
      isAvailable: !!availableSlot,
      availableSlot: availableSlot || null,
      availableDays: schedule.availability.map(slot => slot.day),
      canJoinWaitingList: !availableSlot, // Can join waiting list if not available
      requestedDate: fullDateString,
    };
  }

async create(dto: CreateAppointmentDto): Promise<Appointment> {
  console.log("Received DTO:", dto); // Debugging log
  const requestedTime = moment(dto.dateTime); // this is your requested date/time
  const dayOfWeek = requestedTime.format('dddd'); // e.g., Monday
  const fullDateString = requestedTime.format('dddd MMMM D'); // e.g., Friday July 25
  console.log("Extracted day of week:", dayOfWeek);
  console.log("Full date string:", fullDateString);

  // 1️⃣ fetch the doctor’s schedule
  const schedule = await this.scheduleModel.findOne({ doctorId: dto.doctor });
  if (!schedule) {
    throw new BadRequestException('Doctor does not have an active schedule.');
  }

  const availableSlot = schedule.availability.find(
    (slot) => {
      console.log(`Comparing: "${slot.day}" === "${fullDateString}"`);
      // Check for exact match of the full date string
      return slot.day.trim().toLowerCase() === fullDateString.trim().toLowerCase();
    }
  );

  if (!availableSlot) {
    console.log("Available days:", schedule.availability.map(slot => slot.day));
    
    // Return detailed error information for waiting list functionality
    const errorResponse = {
      message: `Doctor is not available on ${fullDateString}. Available days: ${schedule.availability.map(slot => slot.day).join(', ')}`,
      canJoinWaitingList: true,
      availableDays: schedule.availability.map(slot => slot.day),
      requestedDate: fullDateString,
      doctorId: dto.doctor
    };
    
    throw new BadRequestException(errorResponse);
  }

  // 2️⃣ construct `start` and `end` for *the SAME date as the appointment*
  const appointmentDate = requestedTime.clone().startOf('day');

  const start = appointmentDate.clone().hour(
    parseInt(availableSlot.startTime.split(':')[0], 10)
  ).minute(
    parseInt(availableSlot.startTime.split(':')[1], 10)
  ).second(0).millisecond(0);

  const end = appointmentDate.clone().hour(
    parseInt(availableSlot.endTime.split(':')[0], 10)
  ).minute(
    parseInt(availableSlot.endTime.split(':')[1], 10)
  ).second(0).millisecond(0);

  // 📋 log for debugging
  console.log(`Requested: ${requestedTime.format()}`);
  console.log(`Start:     ${start.format()}`);
  console.log(`End:       ${end.format()}`);

  if (requestedTime.isBefore(start) || requestedTime.isSameOrAfter(end)) {
    throw new BadRequestException(
      `Doctor is only available between ${availableSlot.startTime} and ${availableSlot.endTime} on ${dayOfWeek}.`
    );
  }

  // 3️⃣ check if within a pause
  const pauseConflict = availableSlot.pauses?.some((pause) => {
    const pauseStart = appointmentDate.clone().hour(
      parseInt(pause.start.split(':')[0], 10)
    ).minute(
      parseInt(pause.start.split(':')[1], 10)
    ).second(0).millisecond(0);

    const pauseEnd = appointmentDate.clone().hour(
      parseInt(pause.end.split(':')[0], 10)
    ).minute(
      parseInt(pause.end.split(':')[1], 10)
    ).second(0).millisecond(0);

    return requestedTime.isSameOrAfter(pauseStart) &&
           requestedTime.isBefore(pauseEnd);
  });

  if (pauseConflict) {
    throw new BadRequestException(`Doctor is on a break at this time.`);
  }

  const duration = schedule.appointmentDuration; // in minutes

  // 4️⃣ Check for overlapping appointments
  // Check if any appointment starts within our appointment duration window
  const appointmentEnd = requestedTime.clone().add(duration, 'minutes');
  
  const conflicts = await this.appointmentModel.find({
    doctor: dto.doctor,
    dateTime: {
      $gte: requestedTime.clone().subtract(duration, 'minutes').toDate(),
      $lt: appointmentEnd.toDate(),
    },
  });

  if (conflicts.length > 0) {
    const conflictTime = moment(conflicts[0].dateTime).format('HH:mm');
    throw new BadRequestException(
      `This time slot conflicts with an existing appointment at ${conflictTime}. Please choose another time.`
    );
  }

  // 5️⃣ Create appointment
  const appointmentData = {
    ...dto,
    status: dto.status || 'confirmed', // Set default status
  };
  
  const appointment = new this.appointmentModel(appointmentData);
  const savedAppointment = await appointment.save();

  console.log('✅ Appointment created:', {
    id: savedAppointment._id,
    dateTime: savedAppointment.dateTime,
    status: savedAppointment.status,
    doctor: savedAppointment.doctor,
    patient: savedAppointment.patient
  });

  // 🔔 Notify doctor of new appointment
  try {
    await this.notificationService.notifyDoctorOfNewAppointment(
      dto.doctor,
      dto.patient,
      (savedAppointment as any)._id.toString(),
      new Date(dto.dateTime)
    );
  } catch (error) {
    console.error('Failed to send notification to doctor:', error);
    // Don't fail the appointment creation if notification fails
  }

  // 6️⃣ Add the appointment time slot to pauses
  const appointmentStartTime = requestedTime.format('HH:mm');
  const appointmentEndTime = requestedTime.clone().add(duration, 'minutes').format('HH:mm');

  // Find the availability slot for the day and add the pause (use fullDateString, not dayOfWeek)
  const availabilityIndex = schedule.availability.findIndex(slot => slot.day === fullDateString);
  if (availabilityIndex !== -1) {
    if (!schedule.availability[availabilityIndex].pauses) {
      schedule.availability[availabilityIndex].pauses = [];
    }
    
    schedule.availability[availabilityIndex].pauses.push({
      start: appointmentStartTime,
      end: appointmentEndTime
    });

    console.log(`✅ Added pause ${appointmentStartTime}-${appointmentEndTime} to ${fullDateString}`);
    
    // Save the updated schedule
    await schedule.save();
  }

  return savedAppointment;
}



  async update(id: string, data: Partial<CreateAppointmentDto>): Promise<Appointment> {
    const updated = await this.appointmentModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new NotFoundException('Appointment not found');
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    // First get the appointment to remove its pause from schedule
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Remove the pause from the doctor's schedule
    try {
      const requestedTime = moment(appointment.dateTime);
      const fullDateString = requestedTime.format('dddd MMMM D');
      
      const schedule = await this.scheduleModel.findOne({ doctorId: appointment.doctor });
      if (schedule) {
        const appointmentStartTime = requestedTime.format('HH:mm');
        const appointmentEndTime = requestedTime.clone().add(schedule.appointmentDuration, 'minutes').format('HH:mm');
        
        const availabilityIndex = schedule.availability.findIndex(slot => slot.day === fullDateString);
        if (availabilityIndex !== -1 && schedule.availability[availabilityIndex].pauses) {
          // Remove the pause that matches this appointment
          schedule.availability[availabilityIndex].pauses = schedule.availability[availabilityIndex].pauses.filter(
            pause => !(pause.start === appointmentStartTime && pause.end === appointmentEndTime)
          );
          
          console.log(`✅ Removed pause ${appointmentStartTime}-${appointmentEndTime} from ${fullDateString}`);
          await schedule.save();
        }
      }
    } catch (error) {
      console.error('Failed to remove pause from schedule:', error);
      // Don't fail the deletion if pause removal fails
    }

    // Delete the appointment
    const res = await this.appointmentModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Appointment not found');
    return { message: 'Appointment deleted' };
  }

  async getByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ patient: patientId })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phoneNumber'
        }
      });
  }

  async getByDoctor(doctorId: string): Promise<Appointment[]> {
    console.log('🔍 Fetching appointments for doctor:', doctorId);
    
    const appointments = await this.appointmentModel.find({ doctor: doctorId })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phoneNumber'
        }
      });
    
    console.log('📋 Found appointments:', appointments.length);
    console.log('📋 First appointment patient:', appointments[0]?.patient);
    
    return appointments;
  }

  async getAll(): Promise<Appointment[]> {
    return this.appointmentModel.find()
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phoneNumber'
        }
      });
  }
}
