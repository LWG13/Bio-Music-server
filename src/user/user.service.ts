import { Injectable, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtService: JwtService) {}

  async getData() : Promise<User[]> {
    return this.userModel.find().exec()
  }
  async create(data : any) {
    console.log(data)
    const salt = await bcrypt.genSalt(12);

    // ✅ Bước 2: hash password
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const user = new this.userModel({...data,password: hashedPassword, image: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg", role: "client"});
    const payload = { id: user._id };
    const token = this.jwtService.sign(payload);
   await user.save();
   return { token }
  }
  async login(data: any) {
    const user = await this.userModel.findOne({ email: data.email})
    const isMatch = await bcrypt.compare(data.password, user.password)
    if(!isMatch)  throw new BadRequestException("Invalid password or email")
    const payload = { id: user._id}
    const token = this.jwtService.sign(payload)

    return { token }
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }
  async verify(token: string) {
    const decoded = this.jwtService.verify(token)
    if(!decoded) throw new BadRequestException("token not found")
    const user = await this.userModel.findById(decoded.id)
    
    return {user: user}
    
  }
}
