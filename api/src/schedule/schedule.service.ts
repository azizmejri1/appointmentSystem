import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from './schedule.schema';
import { CreateScheduleDto } from './create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
  ) {}

  async create(dto: CreateScheduleDto): Promise<Schedule> {
    const schedule = new this.scheduleModel(dto);
    return schedule.save();
  }

  async update(id: string, data: Partial<CreateScheduleDto>): Promise<Schedule> {
    const updated = await this.scheduleModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new NotFoundException('Schedule not found');
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const res = await this.scheduleModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Schedule not found');
    return { message: 'Schedule deleted' };
  }

  async getByDoctor(doctorId: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ doctorId });
  }

  async getAll(): Promise<Schedule[]> {
    return this.scheduleModel.find();
  }
}
