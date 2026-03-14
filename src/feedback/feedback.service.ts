import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';

interface FeedbackItem {
  rating: number;
  category: string;
  text: string;
  date: string;
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private readonly feedbackModel: Model<FeedbackDocument>,
  ) {}

  async getFeedback(): Promise<FeedbackItem[]> {
    const feedback = await this.feedbackModel.find().sort({ createdAt: -1 }).lean();
    return feedback.map((item) => ({
      rating: item.rating,
      category: item.category,
      text: item.text,
      date: item.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async submitFeedback(payload: unknown, userId?: string): Promise<FeedbackItem> {
    const body = payload as Pick<FeedbackItem, 'rating' | 'category' | 'text'>;
    const created = await this.feedbackModel.create({
      rating: Number(body.rating),
      category: body.category,
      text: body.text,
      ...(userId ? { userId: new Types.ObjectId(userId) } : {}),
    });

    return {
      rating: created.rating,
      category: created.category,
      text: created.text,
      date: created.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
