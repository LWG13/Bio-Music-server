import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from "./user/user.module"
import { MongooseModule } from '@nestjs/mongoose'
import { FirebaseModule } from "./firebase.config"
import { MusicModule } from "./music/music.module"

import { CloudinaryModule } from "./cloudinary/cloudinary.module"
@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), UserModule, MongooseModule.forRoot(process.env.URL), MusicModule,CloudinaryModule, FirebaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
