import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Appointment extends Document {
  @Prop()
  dateTime: Date;

  @Prop()
  status: string;

  @Prop()
  note: string;

  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient' })
  patient: Types.ObjectId;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
