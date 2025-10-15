import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from "./user/user.module"
import { MongooseModule } from '@nestjs/mongoose'
import { FirebaseModule } from "./firebase.config"

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), UserModule, MongooseModule.forRoot(process.env.URL), FirebaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
