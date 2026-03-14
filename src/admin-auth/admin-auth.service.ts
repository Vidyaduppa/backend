import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { AdminOtp, AdminOtpDocument } from './schemas/admin-otp.schema';
import { AuthService } from '../auth/auth.service';
import { MailService } from './mail.service';

interface OtpRequestPayload {
  email: string;
}

interface OtpVerifyPayload {
  email: string;
  otp: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(AdminOtp.name) private readonly adminOtpModel: Model<AdminOtpDocument>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  async requestOtp(payload: OtpRequestPayload): Promise<{ ok: true }> {
    const email = (payload.email ?? '').trim().toLowerCase();
    const user = await this.userModel.findOne({ email }).lean();
    if (!user || user.role !== 'admin' || user.status !== 'active') {
      return { ok: true };
    }

    const now = Date.now();
    const cooldownMs = 60_000;
    const existing = await this.adminOtpModel.findOne({ userId: user._id });
    if (existing?.lastSentAt && now - existing.lastSentAt.getTime() < cooldownMs) {
      return { ok: true };
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(now + 10 * 60_000);

    await this.adminOtpModel.findOneAndUpdate(
      { userId: user._id },
      {
        userId: new Types.ObjectId(String(user._id)),
        otpHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(now),
      },
      { upsert: true, new: true },
    );

    await this.mailService.sendAdminOtp(user.email, otp);
    return { ok: true };
  }

  async verifyOtp(payload: OtpVerifyPayload): Promise<unknown> {
    const email = (payload.email ?? '').trim().toLowerCase();
    const otp = (payload.otp ?? '').trim();
    const user = await this.userModel.findOne({ email });

    if (!user || user.role !== 'admin' || user.status !== 'active') {
      throw new BadRequestException('Invalid or expired code');
    }

    const record = await this.adminOtpModel.findOne({ userId: user._id });
    if (!record) {
      throw new BadRequestException('Invalid or expired code');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.adminOtpModel.deleteOne({ _id: record._id });
      throw new BadRequestException('Invalid or expired code');
    }

    if (record.attempts >= 5) {
      throw new BadRequestException('Invalid or expired code');
    }

    const ok = await bcrypt.compare(otp, record.otpHash);
    if (!ok) {
      await this.adminOtpModel.updateOne(
        { _id: record._id },
        { $inc: { attempts: 1 } },
      );
      throw new BadRequestException('Invalid or expired code');
    }

    await this.adminOtpModel.deleteOne({ _id: record._id });
    return this.authService.issueAuthForUser(user);
  }
}
