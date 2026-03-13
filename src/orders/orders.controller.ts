import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders(): unknown {
    return this.ordersService.getOrders();
  }

  @Post()
  createOrder(@Body() payload: unknown): unknown {
    return this.ordersService.createOrder(payload);
  }

  @Patch(':id/status')
  updateOrderStatus(@Param('id') id: string, @Body() payload: unknown): unknown {
    return this.ordersService.updateOrderStatus(id, payload);
  }
}
