import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop()
  symptoms: string;

  @Prop()
  vitalSigns: string;

  @Prop()
  diagnosis: string;

  @Prop()
  prescription: string;

  @Prop()
  visitDate: Date;

  @Prop()
  visitType: string;

  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient' })
  patient: Types.ObjectId;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
