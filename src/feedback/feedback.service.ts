import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

interface FeedbackItem {
  productId: string;
  rating: number;
  category: string;
  text: string;
  date: string;
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<FeedbackDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getFeedback(): Promise<FeedbackItem[]> {
    const feedback = await this.feedbackModel.find().sort({ createdAt: -1 }).lean();
    return feedback.map((item) => ({
      productId: String(item.productId),
      rating: item.rating,
      category: item.category,
      text: item.text,
      date: item.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async submitFeedback(payload: unknown, userId: string): Promise<FeedbackItem> {
    const body = payload as Pick<
      FeedbackItem,
      'productId' | 'rating' | 'category' | 'text'
    >;

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user');
    }
    if (!body.productId || !Types.ObjectId.isValid(body.productId)) {
      throw new BadRequestException('productId is required');
    }

    const allowedStatuses: Array<Order['status']> = ['Shipped', 'Delivered'];
    const hasEligibleOrder = await this.orderModel.exists({
      userId: new Types.ObjectId(userId),
      status: { $in: allowedStatuses },
      'items.productId': new Types.ObjectId(body.productId),
    });
    if (!hasEligibleOrder) {
      throw new ForbiddenException(
        'Feedback is allowed only after the order is shipped or delivered',
      );
    }

    const created = await this.feedbackModel.create({
      productId: new Types.ObjectId(body.productId),
      rating: Number(body.rating),
      category: body.category,
      text: body.text,
      userId: new Types.ObjectId(userId),
    });

    return {
      productId: String(created.productId),
      rating: created.rating,
      category: created.category,
      text: created.text,
      date: created.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
