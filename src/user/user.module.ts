import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user';
import { CloudinaryModule } from "../cloudinary/cloudinary.module"
import { Otp, OtpSchema } from 'src/schema/otp';
import { MailModule } from "./mail.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: "users" }]),MailModule,MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema, collection: "otps" }]),JwtModule.register({
      secret: "hielojb", 
      signOptions: { expiresIn: '7d' },
    }),CloudinaryModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}

