import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,Types } from 'mongoose';
import { User } from "./user"

export type MusicDocument = Music & Document;

@Schema({ timestamps: true }) 
export class Music {
  @Prop({ required: true })
  title: string;
  @Prop({ default: "music"})
  type: string

   @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  singerId: User | Types.ObjectId;

  
  @Prop({ default: '' })
  image: string;
  
  @Prop()
  audio: string;

  @Prop()
  category: string


  @Prop({default: []})
 like: String[]
 
}

export const MusicSchema = SchemaFactory.createForClass(Music);