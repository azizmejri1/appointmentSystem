import { ArgumentsHost, Body, Catch, Controller, ExceptionFilter, Get, Post, Req, Res, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';



@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,private jwtService: JwtService,) {}
    @Post('login')
    async login(
      @Body() body: { email: string; password: string},
      @Res({ passthrough: true }) res: Response
    ) {
      const user = await this.authService.login(body.email, body.password);
      const token = user.access_token;
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, 
      });

      return { message: 'Logged in', userId: user.user._id , role : user.role };
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // should match your login settings
      });

      return { message: 'Logged out' };
    }
    
    @Get('profile')
  async getProfile(@Req() req: Request) {
    const token = req.cookies?.token;

    if (!token) {
      return { loggedIn: false };
    }

    try {
      const decoded = this.jwtService.verify(token);
      return {
        loggedIn: true,
        user: decoded,
      };
    } catch (err) {
      return { loggedIn: false };
    }
  }
  }

