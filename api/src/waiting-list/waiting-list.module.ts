import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WaitingList, WaitingListSchema } from './waiting-list.schema';
import { WaitingListService } from './waiting-list.service';
import { WaitingListController } from './waiting-list.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: WaitingList.name, schema: WaitingListSchema }])],
  exports: [MongooseModule],
  providers: [WaitingListService],
  controllers: [WaitingListController],
})
export class WaitingListModule {}
