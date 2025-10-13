import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: "users" }]),JwtModule.register({
      secret: "hielojb", 
      signOptions: { expiresIn: '7d' },
    }),],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}

