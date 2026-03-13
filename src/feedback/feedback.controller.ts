import { Body, Controller, Get, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  getFeedback(): unknown {
    return this.feedbackService.getFeedback();
  }

  @Post()
  submitFeedback(@Body() payload: unknown): unknown {
    return this.feedbackService.submitFeedback(payload);
  }
}
