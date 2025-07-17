import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post('signup')
  async signup(@Body() body: CreateDoctorDto) {
    return this.doctorService.signup(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDoctorDto) {
    return this.doctorService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.doctorService.delete(id);
  }
}
