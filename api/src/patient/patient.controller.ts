import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('signup')
  async signup(@Body() body: CreatePatientDto) {
    return this.patientService.signup(body);
  }

  @Get()
  async getPatientsByDoctor(@Query('doctorId') doctorId: string) {
    if (doctorId) {
      return this.patientService.getPatientsByDoctor(doctorId);
    }
    // Could add logic to return all patients if needed
    return { message: 'Doctor ID is required', data: [] };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.patientService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePatientDto) {
    return this.patientService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.patientService.delete(id);
  }

  @Post('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.patientService.verifyEmail(token);
  }

  @Post(':id/resend-verification')
  async resendVerificationEmail(@Param('id') id: string) {
    return this.patientService.resendVerificationEmail(id);
  }

  @Post(':id/verify-phone')
  async verifyPhone(@Param('id') id: string, @Body() body: { phoneNumber: string }) {
    return this.patientService.verifyPhone(id, body.phoneNumber);
  }

  @Get(':id/appointments')
  async getPatientAppointments(@Param('id') id: string) {
    return this.patientService.getPatientAppointments(id);
  }
}
