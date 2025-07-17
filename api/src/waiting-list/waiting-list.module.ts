import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WaitingList, WaitingListSchema } from './waiting-list.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: WaitingList.name, schema: WaitingListSchema }])],
  exports: [MongooseModule],
})
export class WaitingListModule {}
