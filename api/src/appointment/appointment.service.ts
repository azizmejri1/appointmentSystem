import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './appointment.schema';
import { Model } from 'mongoose';
import { CreateAppointmentDto } from './create-appointment.dto';
import * as moment from 'moment';
import { Schedule } from 'src/schedule/schedule.schema';
import { Patient } from 'src/patient/patient.schema';
import { User } from 'src/user/user.schema';


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
  ) {}


async create(dto: CreateAppointmentDto): Promise<Appointment> {
  console.log("Received DTO:", dto); // Debugging log
  const requestedTime = moment(dto.dateTime); // this is your requested date/time
  const dayOfWeek = requestedTime.format('dddd'); // e.g., Monday

  // 1️⃣ fetch the doctor’s schedule
  const schedule = await this.scheduleModel.findOne({ doctorId: dto.doctor });
  if (!schedule) {
    throw new BadRequestException('Doctor does not have an active schedule.');
  }

  const availableSlot = schedule.availability.find(
    (slot) => slot.day === dayOfWeek,
  );

  if (!availableSlot) {
    throw new BadRequestException(`Doctor is not available on ${dayOfWeek}.`);
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

  // 4️⃣ Check nearby appointments to avoid overlaps
  const windowStart = requestedTime.clone().subtract(duration, 'minutes');
  const windowEnd = requestedTime.clone().add(duration, 'minutes');

  const conflict = await this.appointmentModel.findOne({
    doctor: dto.doctor,
    dateTime: {
      $gte: windowStart.toDate(),
      $lt: windowEnd.toDate(),
    },
  });

  if (conflict) {
    throw new BadRequestException(
      'This time slot or a nearby slot is already booked. Please choose another time.'
    );
  }

  // 5️⃣ Create appointment
  const appointment = new this.appointmentModel(dto);
  const savedAppointment = await appointment.save();

  // 6️⃣ Add the appointment time slot to pauses
  const appointmentStartTime = requestedTime.format('HH:mm');
  const appointmentEndTime = requestedTime.clone().add(duration, 'minutes').format('HH:mm');

  // Find the availability slot for the day and add the pause
  const availabilityIndex = schedule.availability.findIndex(slot => slot.day === dayOfWeek);
  if (availabilityIndex !== -1) {
    if (!schedule.availability[availabilityIndex].pauses) {
      schedule.availability[availabilityIndex].pauses = [];
    }
    
    schedule.availability[availabilityIndex].pauses.push({
      start: appointmentStartTime,
      end: appointmentEndTime
    });

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
