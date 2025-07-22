import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class WaitingList extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient' })
  patient: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const WaitingListSchema = SchemaFactory.createForClass(WaitingList);
