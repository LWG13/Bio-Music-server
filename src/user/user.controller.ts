import { Controller, Get, Post, Body, BadRequestException, Res,Put, Req, UsePipes, ValidationPipe} from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';

import { Response, Request } from 'express';
import { RegisterUserDto, LoginUserDto, GoogleAuthDto } from "../dto"
import { Otp, OtpDocument} from "../schema/otp"
import * as otpGenerator from 'otp-generator';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel} from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User, UserDocument } from "../schema/user"

@Controller("user")
export class UserController {
  constructor(private readonly mailerService: MailerService,@InjectModel(Otp.name) private otpModel: Model<OtpDocument>,private readonly userService: UserService, @InjectModel(User.name) private userModel: Model<UserDocument>) {
    
  }
  @Post('send-otp')
  async sendOtp(@Req() req: Request) {
    const { email } = req.body;

    if (!email) throw new BadRequestException('Email is required');

    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Email not found');

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    await this.otpModel.deleteMany({ email });

    await this.otpModel.create({ email, otp });
  try {
  await this.mailerService.sendMail({
    to: email,
    subject: 'Mã OTP của bạn',
    text: `Mã OTP của bạn là ${otp}`,
  });
} catch (err) {
  console.log("MAIL ERROR:", err);
  throw err;
  }
    return email 
  }


  @Post('verify-otp')
  async verifyOtp(@Req() req: Request) {
    const { email, otp } = req.body;

    if (!email || !otp)
      throw new BadRequestException('Missing fields');

    const otpDoc = await this.otpModel.findOne({ email, otp });
    if (!otpDoc) throw new BadRequestException('Invalid OTP');

    return { message: 'Verified' };
  }

  // 3️⃣ RESET PASSWORD
  @Post('reset-password')
  async resetPassword(@Req() req: Request) {
    const { email, password } = req.body;

    if (!email || !password)
      throw new BadRequestException('Missing fields');

    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Email not found');

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    await this.userModel.updateOne(
      { email },
      { $set: { password: hash } },
    );

    // Xoá OTP ngay sau khi đổi mật khẩu
    await this.otpModel.deleteMany({ email });

    return { message: 'Password updated' };
  }
  @Get()
  getData() {
    return this.userService.getData();
  }
  @Post("signup")
  async create(@Res({ passthrough: true }) res: Response, @Body() body : RegisterUserDto) {
    const existing = await this.userService.findByEmail(body.email);
  if (existing) throw new BadRequestException('Email already exists')
    
    const { token } = await this.userService.create(body)
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, // bật khi chạy HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {message: "success"}
  }
  @Post("login") 
  async login(@Res({ passthrough: true}) res: Response, @Body() body: LoginUserDto) {
    const user = await this.userService.findByEmail(body.email)
    if(!user) throw new BadRequestException("Email or password not found")

    const { token } = await this.userService.login(body)
    if(token === "invalid password or email") throw new BadRequestException("Email or password not found")
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, // bật khi chạy HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return {message: "success"}
  }
  @Get("verify")
  async verify(@Req() req: Request) {
    const token = req.cookies["jwt"]
    if(!token) throw new BadRequestException("Token not found")
    return this.userService.verify(token)
  }
  @Post("logout")
logout(@Res({ passthrough: true }) res: Response) {
  // Xóa cookie JWT
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true, // bật khi chạy HTTPS
  });
  return { message: "Logged out successfully" };
}
  @Post('google')
  async firebaseLogin(@Res({ passthrough: true}) res: Response, @Body() token: any) {
    console.log("token", token.token)
    const { tokenJWT } =  await this.userService.google(token.token);
    console.log("trả về",tokenJWT)
    res.cookie('jwt', tokenJWT, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, // bật khi chạy HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {message: "success"}

    
  }
  @Get("detail/:id") 
  async detail(@Req() req: Request) {
    return this.userService.userDetail(req.params.id)
  }
 @Post("follow")
  async follow(@Req() req: Request) {
    return this.userService.follow(req.body.userId, req.body.followId)
  }
  @Put("editUser") 
  async edituser(@Req() req: Request) {
    return this.userService.editUser(req.body._id, req.body)
  }
  @Put("editPassword")
  async editPassword(@Req() req: Request) {
    return this.userService.editPassword(req.body._id, req.body.passwordUser, req.body.newPassword)
  }
}
