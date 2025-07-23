import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Notification extends Document {
  @Prop()
  message: string;

  @Prop()
  time: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ enum: ['appointment_created', 'appointment_reminder', 'general'], default: 'general' })
  type: string;

  @Prop({ type: Types.ObjectId, required: false })
  relatedId: Types.ObjectId; // Can reference appointments or other entities

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
