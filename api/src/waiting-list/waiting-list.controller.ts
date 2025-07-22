import { Controller, Post, Get, Delete, Body, Query } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';

@Controller('waiting-list')
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Post('join')
  async joinWaitingList(@Body('doctorId') doctorId: string, @Body('patientId') patientId: string) {
    console.log('Received doctorId:', doctorId);
    console.log('Received patientId:', patientId);
    return this.waitingListService.joinWaitingList(doctorId, patientId);
  }

  @Get()
  async getWaitingList(@Query('doctorId') doctorId: string) {
    return this.waitingListService.getWaitingList(doctorId);
  }

  @Delete('leave')
  async leaveWaitingList(@Body('doctorId') doctorId: string, @Body('patientId') patientId: string) {
    return this.waitingListService.leaveWaitingList(doctorId, patientId);
  }
}
