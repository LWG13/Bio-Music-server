import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Music } from './music';
import { User } from "./user"

export type PlaylistDocument = Playlist & Document;

@Schema({ timestamps: true }) 
export class Playlist {
  @Prop({ required: true})
  title: string;

  @Prop({ default: "playlist"})
  type: string
  
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: User | Types.ObjectId;

  
  @Prop()
  image: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: Music.name }], default: [] })
   musicList: Music[];
  @Prop({ default: "public" })
  isPublic: string
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);