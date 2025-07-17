import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Schedule extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctorId: Types.ObjectId;

  @Prop([
    {
      day: String,                 
      startTime: String,          
      endTime: String,           
      pauses: [
        {
          start: String,          
          end: String            
        }
      ],
    },
  ])
  availability: {
    day: string;
    startTime: string;
    endTime: string;
    pauses: { start: string; end: string }[];
  }[];

  @Prop({ type: Number, required: true })
  appointmentDuration: number;   
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
