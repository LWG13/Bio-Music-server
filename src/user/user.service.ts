import { Injectable, BadRequestException, Inject} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private jwtService: JwtService, @Inject('FIREBASE_ADMIN') private firebaseApp: admin.app.App) {}

  async google(token: string) {
    try {
      if (!this.firebaseApp) {
        throw new BadRequestException('Firebase is not configured. Please contact administrator.');
      }

      const decoded = await this.firebaseApp.auth().verifyIdToken(token);
      console.log("decoded", decoded)
      const email = decoded.email;
      const uid = decoded.uid;
      const name = decoded.name || email.split('@')[0];
      const avatar = decoded.picture || '';

      let user = await this.userModel.findById(email)


      if (!user) {
        const newUser = new this.userModel({
          email: email,
          username: name,
          image: avatar,
          role: "client"
        })
         
        const payload = { id: newUser._id };
        const tokenJWT = this.jwtService.sign(payload);
        await newUser.save()
         return { tokenJWT }
      }
       
      const payload = { id: user._id };
      const tokenJWT = this.jwtService.sign(payload);

      return { tokenJWT };
    } catch (err) {
      console.error('Firebase verification error:', err);
      throw new BadRequestException('Invalid Firebase token');
    }
  }
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
