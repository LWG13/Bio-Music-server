import { Controller, Get, Post, Body, BadRequestException, Res, Req} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from "../schema/user"
import { Response, Request } from 'express';

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {
    
  }
  @Get()
  getData() {
    return this.userService.getData();
  }
  @Post("signup")
  async create(@Res({ passthrough: true }) res: Response, @Body() body : any) {
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
  async login(@Res({ passthrough: true}) res: Response, @Body() body: any) {
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
}
