import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Music } from './music';
import { User } from "./user"

export type AlbumDocument = Album & Document;

@Schema({ timestamps: true }) 
export class Album {
  @Prop({ required: true})
  title: string;

  @Prop({ default: "album"})
  type: string
  
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  singerId: User | Types.ObjectId;

  
  @Prop()
  image: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: Music.name }], default: [] })
   musicList: Music[];
  
}

export const AlbumSchema = SchemaFactory.createForClass(Album);