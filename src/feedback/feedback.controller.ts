import { Body, Controller, Get, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AuthService } from '../auth/auth.service';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getFeedback(): Promise<unknown> {
    return this.feedbackService.getFeedback();
  }

  @Post()
  async submitFeedback(@Body() payload: unknown): Promise<unknown> {
    const user = await this.authService.getCurrentUser();
    return this.feedbackService.submitFeedback(payload, user?.id);
  }
}
