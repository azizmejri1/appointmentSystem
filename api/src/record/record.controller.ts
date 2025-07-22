import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Record } from './record.schema';
import { RecordService } from './record.service';

@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post(':patientId/:doctorId')
  async createRecord(
    @Param('patientId') patientId: string,
    @Param('doctorId') doctorId: string,
    @Body() consultation: Record['consultations'][0],
  ): Promise<Record> {
    return this.recordService.createRecord(patientId, doctorId, consultation);
  }

  @Delete(':recordId/:consultationId')
  async deleteConsultation(
    @Param('recordId') recordId: string,
    @Param('consultationId') consultationId: string,
  ): Promise<Record> {
    return this.recordService.deleteConsultation(recordId, consultationId);
  }

  @Patch(':recordId/:consultationId')
  async updateConsultation(
    @Param('recordId') recordId: string,
    @Param('consultationId') consultationId: string,
    @Body() updatedConsultation: Record['consultations'][0],
  ): Promise<Record> {
    return this.recordService.updateConsultation(
      recordId,
      consultationId,
      updatedConsultation,
    );
  }

  @Get(':patientId')
  async getRecordsByPatient(@Param('patientId') patientId: string): Promise<Record[]> {
    return this.recordService.getRecordsByPatient(patientId);
  }
}
