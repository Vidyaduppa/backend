import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Feedback, FeedbackDocument } from '../feedback/schemas/feedback.schema';

interface AdminAnalyticsResponse {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  averageRating: number;
  topProducts: Array<{ name: string; sales: number }>;
  revenueByCategory: Array<{ category: string; amount: number }>;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<FeedbackDocument>,
  ) {}

  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    const [totalOrders, totalRevenueAgg, activeUsers, avgRatingAgg] =
      await Promise.all([
        this.orderModel.countDocuments(),
        this.orderModel.aggregate<{ total: number }>([
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        this.userModel.countDocuments({ status: 'active' }),
        this.feedbackModel.aggregate<{ average: number }>([
          { $group: { _id: null, average: { $avg: '$rating' } } },
        ]),
      ]);

    const topProductsAgg = await this.orderModel.aggregate<{
      productId: string;
      name: string;
      sales: number;
    }>([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          sales: { $sum: '$items.quantity' },
          name: { $first: '$items.name' },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 10 },
    ]);

    const revenueByCategoryAgg = await this.orderModel.aggregate<{
      _id: string;
      amount: number;
    }>([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          amount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenueAgg[0]?.total ?? 0,
      activeUsers,
      averageRating: avgRatingAgg[0]?.average ?? 0,
      topProducts: topProductsAgg.map((item) => ({
        name: item.name,
        sales: item.sales,
      })),
      revenueByCategory: revenueByCategoryAgg.map((item) => ({
        category: item._id,
        amount: item.amount,
      })),
    };
  }
}
