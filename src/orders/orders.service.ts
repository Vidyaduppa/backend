import { Injectable, NotFoundException } from '@nestjs/common';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CreateOrderRequest {
  items: CartItem[];
}

interface UpdateOrderStatusRequest {
  status: 'Processing' | 'Shipped' | 'Delivered';
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  items: CartItem[];
}

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  getOrders(): Order[] {
    return this.orders;
  }

  createOrder(payload: unknown): Order {
    const body = payload as CreateOrderRequest;
    const total = 0;

    const created: Order = {
      id: `o${Date.now()}`,
      date: new Date().toISOString(),
      total,
      status: 'Processing',
      items: body.items ?? [],
    };

    this.orders.unshift(created);
    return created;
  }

  updateOrderStatus(id: string, payload: unknown): Order {
    const body = payload as UpdateOrderStatusRequest;
    const index = this.orders.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException('Order not found');
    }

    const updated: Order = {
      ...this.orders[index],
      status: body.status,
    };

    this.orders[index] = updated;
    return updated;
  }
}
