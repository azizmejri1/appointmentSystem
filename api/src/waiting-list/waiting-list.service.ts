import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WaitingList } from './waiting-list.schema';

@Injectable()
export class WaitingListService {
  constructor(
    @InjectModel(WaitingList.name) private waitingListModel: Model<WaitingList>,
  ) {}

  async joinWaitingList(doctorId: string, patientId: string) {
    const existingEntry = await this.waitingListModel.findOne({ doctor: doctorId, patient: patientId });
    if (existingEntry) {
      throw new HttpException(
        'Patient is already on the waiting list for this doctor.',
        HttpStatus.CONFLICT,
      );
    }

    const waitingListEntry = new this.waitingListModel({
      doctor: doctorId,
      patient: patientId,
      createdAt: new Date(),
    });

    await waitingListEntry.save();
    console.log('Returning response:', { message: 'Successfully joined the waiting list.' });
    return { message: 'Successfully joined the waiting list.' };
  }

  async getWaitingList(doctorId: string) {
    return this.waitingListModel.find({ doctor: doctorId }).populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber',
      },
    });
  }

  async leaveWaitingList(doctorId: string, patientId: string) {
    const result = await this.waitingListModel.deleteOne({ doctor: doctorId, patient: patientId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Patient not found on the waiting list for this doctor.');
    }
    return { message: 'Successfully left the waiting list.' };
  }
}
