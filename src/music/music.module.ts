import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Music, MusicSchema } from '../schema/music';
import { User, UserSchema } from '../schema/user';

import { Album, AlbumSchema } from '../schema/album';
import { Notification, NotificationSchema } from "../schema/notification"
import { Playlist, PlaylistSchema } from 'src/schema/playlist';
import { CloudinaryModule } from "../cloudinary/cloudinary.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Music.name, schema: MusicSchema, collection: "musics" }]),MongooseModule.forFeature([{ name: Album.name, schema: AlbumSchema, collection: "albums" }]),MongooseModule.forFeature([{ name: User.name, schema:UserSchema, collection: "users" }]),MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema, collection: "notifications" }]),JwtModule.register({
      secret: "hielojb", 
      signOptions: { expiresIn: '7d' },
    }), MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema, collection: "playlists" }]), CloudinaryModule],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService]
})
export class MusicModule {}
