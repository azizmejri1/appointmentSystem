import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, DoctorSchema } from './doctor.schema';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { User, UserSchema } from 'src/user/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema },{ name: User.name, schema: UserSchema }])],
  exports: [MongooseModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
