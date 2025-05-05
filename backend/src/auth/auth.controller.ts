import { Controller, Post, Body, Get, Headers, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body('id_number') id_number: string, @Body('phone') phone: string) {
    console.log('Login attempt:', { id_number, phone }); // log ดูค่าที่ส่งมาจริงๆ
    return this.authService.login(id_number, phone);
  }

}
