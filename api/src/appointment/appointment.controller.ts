import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAppointmentDto } from './create-appointment.dto';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles('patient')
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto);
  }

  @Put(':id')
  @Roles('patient')
  update(@Param('id') id: string, @Body() body: Partial<CreateAppointmentDto>) {
    return this.appointmentService.update(id, body);
  }

  @Delete(':id')
  @Roles('patient')
  delete(@Param('id') id: string) {
    return this.appointmentService.delete(id);
  }

  @Get()
  @Roles('doctor', 'patient')
  get(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
  ) {
    if (doctorId) {
      return this.appointmentService.getByDoctor(doctorId);
    } else if (patientId) {
      return this.appointmentService.getByPatient(patientId);
    }
    return this.appointmentService.getAll();
  }
}
