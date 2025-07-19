import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema()
export class Doctor extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId ;

  @Prop()
  speciality?: string;

  @Prop()
  city?: string;

  @Prop()
  adress?: string;

  @Prop()
  location_maps?: string;

  @Prop()
  credential_img?: string;

  @Prop({ default: false })
  verified: boolean;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
