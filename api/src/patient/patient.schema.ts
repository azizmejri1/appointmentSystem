import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema()
export class Patient extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop()
  emailVerificationCode?: string;

  @Prop()
  emailVerificationExpiry?: Date;

  // Add more patient-specific fields if needed
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
