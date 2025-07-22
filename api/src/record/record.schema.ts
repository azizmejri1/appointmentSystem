import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
        symptoms: String,
        vitalSigns: String,
        diagnosis: String,
        prescription: String,
        visitDate: Date,
        visitType: String,
      },
    ],
  })
  consultations: {
    _id: Types.ObjectId;
    symptoms: string;
    vitalSigns: string;
    diagnosis: string;
    prescription: string;
    visitDate: Date;
    visitType: string;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient' })
  patient: Types.ObjectId;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
