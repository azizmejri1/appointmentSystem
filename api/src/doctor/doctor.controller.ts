import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './doctor.schema';

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

  @Get('search')
  async search(
    @Query('speciality') speciality: string,
    @Query('city') city: string,
  ) {
    return this.doctorService.searchDoctors(speciality, city);
  }

  @Get('specialities')
  async getAvailableSpecialities() {
    const specialities = await this.doctorService.getAvailableSpecialities();
    return { specialities };
  }

  @Get('cities')
  async getAvailableCities() {
    const cities = await this.doctorService.getAvailableCities();
    return { cities };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Doctor> {
    return this.doctorService.findOne(id);
  }

  @Get()
  async findAllDoctors(): Promise<Doctor[]> {
    return this.doctorService.findAllDoctors();
  }

  @Post(':id/upload-credentials')
  async uploadCredentials(@Param('id') id: string, @Body() body: { credential_img: string }) {
    return this.doctorService.uploadCredentials(id, body.credential_img);
  }

  @Post(':id/verify-phone')
  async verifyPhone(@Param('id') id: string, @Body() body: { phoneNumber: string }) {
    return this.doctorService.verifyPhone(id, body.phoneNumber);
  }

  @Post('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.doctorService.verifyEmail(token);
  }

  @Post(':id/resend-verification')
  async resendVerificationEmail(@Param('id') id: string) {
    return this.doctorService.resendVerificationEmail(id);
  }

}
