import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { MailService } from './mail.service';
import { AdminOtp, AdminOtpSchema } from './schemas/admin-otp.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AdminOtp.name, schema: AdminOtpSchema },
    ]),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, MailService],
})
export class AdminAuthModule {}
