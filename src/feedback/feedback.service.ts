import { Injectable } from '@nestjs/common';

interface FeedbackItem {
  rating: number;
  category: string;
  text: string;
  date: string;
}

@Injectable()
export class FeedbackService {
  private feedback: FeedbackItem[] = [];

  getFeedback(): FeedbackItem[] {
    return this.feedback;
  }

  submitFeedback(payload: unknown): FeedbackItem {
    const body = payload as Pick<FeedbackItem, 'rating' | 'category' | 'text'>;
    const created: FeedbackItem = {
      rating: Number(body.rating),
      category: body.category,
      text: body.text,
      date: new Date().toISOString(),
    };

    this.feedback.unshift(created);
    return created;
  }
}
