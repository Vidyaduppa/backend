import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AdminOtpDocument = HydratedDocument<AdminOtp> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false, collection: 'admin_otps' })
export class AdminOtp {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  otpHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop()
  lastSentAt?: Date;
}

export const AdminOtpSchema = SchemaFactory.createForClass(AdminOtp);
