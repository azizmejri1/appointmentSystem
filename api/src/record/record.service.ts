import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record } from './record.schema';

@Injectable()
export class RecordService {
  constructor(@InjectModel(Record.name) private recordModel: Model<Record>) {}

  async createRecord(patientId: string, doctorId: string, consultation: Record['consultations'][0]): Promise<Record> {
    let record = await this.recordModel.findOne({ patient: patientId });

    if (!record) {
      record = new this.recordModel({ patient: patientId, doctor: doctorId, consultations: [] });
    }

    record.consultations.push(consultation);
    return record.save();
  }

  async deleteConsultation(recordId: string, consultationId: string): Promise<Record> {
    const record = await this.recordModel.findById(recordId);

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    record.consultations = record.consultations.filter(
      (consultation) => consultation._id.toString() !== consultationId,
    );

    return record.save();
  }

  async updateConsultation(
    recordId: string,
    consultationId: string,
    updatedConsultation: Record['consultations'][0],
  ): Promise<Record> {
    const record = await this.recordModel.findById(recordId);

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    const consultationIndex = record.consultations.findIndex(
      (consultation) => consultation._id.toString() === consultationId,
    );

    if (consultationIndex === -1) {
      throw new NotFoundException('Consultation not found');
    }

    record.consultations[consultationIndex] = updatedConsultation;
    return record.save();
  }

  async getRecordsByPatient(patientId: string): Promise<Record[]> {
    return this.recordModel.find({ patient: patientId });
  }
}
