import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: "users" }]),],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}

