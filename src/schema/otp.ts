import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({
  timestamps: true
})
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  // TTL index – tự xoá sau 5 phút
  @Prop({ type: Date, default: Date.now, expires: 300 })
  createdAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);