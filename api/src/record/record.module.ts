import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Record, RecordSchema } from './record.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Record.name, schema: RecordSchema }])],
  exports: [MongooseModule],
})
export class RecordModule {}
