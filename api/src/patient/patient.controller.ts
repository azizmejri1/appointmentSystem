import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
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

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePatientDto) {
    return this.patientService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.patientService.delete(id);
  }
}
