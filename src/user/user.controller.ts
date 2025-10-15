import { Controller, Get, Post, Body, BadRequestException, Res, Req, UsePipes, ValidationPipe} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from "../schema/user"
import { Response, Request } from 'express';
import { RegisterUserDto, LoginUserDto, GoogleAuthDto } from "../dto"

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {
    
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
  async firebaseLogin(@Res({ passthrough: true}) res: Response, @Body() token: string) {
    console.log("token", token)
    const { tokenJWT } =  await this.userService.google(token);
    console.log("trả về",tokenJWT)
    res.cookie('jwt', tokenJWT, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, // bật khi chạy HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {message: "success"}
    
  }
}
