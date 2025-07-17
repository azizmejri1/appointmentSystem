import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
    @Post('login')
    async login(
      @Body() body: { email: string; password: string },
      @Res({ passthrough: true }) res: Response
    ) {
      const user = await this.authService.login(body.email, body.password);
      const token = user.access_token;
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false, 
      });

      return { message: 'Logged in', userId: user.user._id };
    }
    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Req() req: any) {
      return req.user;
    }
  }

