import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

export interface UserProfile {
  name: string;
  email: string;
  address: string;
}

interface UpdateUserStatusRequest {
  status: 'active' | 'blocked';
}

interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'blocked';
  orders: number;
  joinedAt: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      name: user.name,
      email: user.email,
      address: user.address ?? '',
    };
  }

  async updateUserProfile(userId: string, profile: unknown): Promise<UserProfile> {
    const body = profile as UserProfile;
    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          name: body.name,
          email: body.email,
          address: body.address ?? '',
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return {
      name: updated.name,
      email: updated.email,
      address: updated.address ?? '',
    };
  }

  async getUsers(): Promise<AdminUserSummary[]> {
    const users = await this.userModel.find().sort({ createdAt: -1 }).lean();
    const counts = await this.orderModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const orderCounts = new Map(counts.map((item) => [String(item._id), item.count]));

    return users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      status: user.status,
      orders: orderCounts.get(String(user._id)) ?? 0,
      joinedAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async updateUserStatus(id: string, payload: unknown): Promise<AdminUserSummary> {
    const body = payload as UpdateUserStatusRequest;
    const updated = await this.userModel
      .findByIdAndUpdate(id, { status: body.status }, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    const orders = await this.orderModel.countDocuments({ userId: updated._id });
    return {
      id: String(updated._id),
      name: updated.name,
      email: updated.email,
      status: updated.status,
      orders,
      joinedAt: updated.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
