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
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateScheduleDto } from './create-schedule.dto';

@Controller('schedules')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Roles('doctor')
  create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @Put(':id')
  @Roles('doctor')
  update(@Param('id') id: string, @Body() body: Partial<CreateScheduleDto>) {
    return this.scheduleService.update(id, body);
  }

  @Delete(':id')
  @Roles('doctor')
  delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }

  @Get()
  @Roles('doctor', 'patient')
  get(@Query('doctorId') doctorId?: string) {
    if (doctorId) {
      return this.scheduleService.getByDoctor(doctorId);
    }
    return this.scheduleService.getAll();
  }
}
