import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) 
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  username: string;

  @Prop({ default: '' })
  image: string;

  @Prop() 
  role: string

  @Prop({default: []})
  follower: String[]
}

export const UserSchema = SchemaFactory.createForClass(User);