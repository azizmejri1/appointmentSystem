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
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
