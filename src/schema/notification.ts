import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userGiveId: string | null;

  @Prop()
  userGetId: string; 

  @Prop()
  message: string;

  @Prop()
  type: string; // "music", "album"
  @Prop({isSeen: false}) 
  isSeen: boolean
  @Prop()
 postId: string
}
export const NotificationSchema = SchemaFactory.createForClass(Notification)