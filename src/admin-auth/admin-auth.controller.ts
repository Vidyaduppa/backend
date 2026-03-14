import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin/otp')
@UseGuards(ThrottlerGuard)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('request')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  requestOtp(@Body() payload: { email: string }) {
    return this.adminAuthService.requestOtp(payload);
  }

  @Post('verify')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  verifyOtp(@Body() payload: { email: string; otp: string }): Promise<unknown> {
    return this.adminAuthService.verifyOtp(payload);
  }
}
