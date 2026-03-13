import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() payload: unknown): unknown {
    return this.authService.register(payload);
  }

  @Post('login')
  login(@Body() payload: unknown): unknown {
    return this.authService.login(payload);
  }

  @Post('logout')
  logout(): void {
    return this.authService.logout();
  }

  @Get('me')
  me(): unknown {
    return this.authService.me();
  }
}
