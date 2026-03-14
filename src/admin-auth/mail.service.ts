import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendAdminOtp(email: string, otp: string): Promise<void> {
    const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const from = process.env.MAIL_FROM ?? user ?? 'no-reply@shop.local';

    if (!user || !pass) {
      this.logger.warn(
        `[Mail] SMTP not configured. OTP for ${email}: ${otp}`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your admin OTP code',
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    });
  }
}
