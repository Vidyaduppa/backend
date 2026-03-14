import { Body, Controller, Get, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthService } from '../auth/auth.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getOrders(): Promise<unknown> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    const isAdmin = user.role === 'admin';
    return this.ordersService.getOrders(user.id, isAdmin);
  }

  @Post()
  async createOrder(@Body() payload: unknown): Promise<unknown> {
    const userId = await this.authService.getCurrentUserId();
    return this.ordersService.createOrder(userId, payload);
  }

  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() payload: unknown,
  ): Promise<unknown> {
    return this.ordersService.updateOrderStatus(id, payload);
  }
}
