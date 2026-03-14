import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order as OrderEntity, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../honey-ecommerce/schemas/product.schema';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CreateOrderRequest {
  items: CartItem[];
  shipping?: {
    name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  paymentMethod: 'card' | 'paypal' | 'apple';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
}

interface UpdateOrderStatusRequest {
  status: 'Processing' | 'In Transit' | 'Shipped' | 'Delivered' | 'Cancelled';
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'In Transit' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(OrderEntity.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async getOrders(userId: string, isAdmin: boolean): Promise<Order[]> {
    const filter = isAdmin ? {} : { userId };
    const orders = await this.orderModel.find(filter).sort({ createdAt: -1 }).lean();
    return orders.map((order) => ({
      id: String(order._id),
      date: order.createdAt?.toISOString() ?? new Date().toISOString(),
      total: order.total,
      status: order.status,
      items: order.items.map((item) => ({
        productId: String(item.productId),
        quantity: item.quantity,
      })),
    }));
  }

  async createOrder(userId: string, payload: unknown): Promise<Order> {
    const body = payload as CreateOrderRequest;
    const itemIds = (body.items ?? []).map((item) => item.productId);
    const products = await this.productModel
      .find({ _id: { $in: itemIds } })
      .lean();

    const items = (body.items ?? []).map((item) => {
      const product = products.find((prod) => String(prod._id) === item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      return {
        productId: new Types.ObjectId(item.productId),
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const created = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items,
      shipping: body.shipping,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus ?? 'pending',
      transactionId: body.transactionId,
      paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
      total,
      status: 'Processing',
    });

    return {
      id: String(created._id),
      date: created.createdAt?.toISOString() ?? new Date().toISOString(),
      total: created.total,
      status: created.status,
      items: created.items.map((item) => ({
        productId: String(item.productId),
        quantity: item.quantity,
      })),
    };
  }

  async updateOrderStatus(id: string, payload: unknown): Promise<Order> {
    const body = payload as UpdateOrderStatusRequest;
    const updated = await this.orderModel
      .findByIdAndUpdate(id, { status: body.status }, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: String(updated._id),
      date: updated.createdAt?.toISOString() ?? new Date().toISOString(),
      total: updated.total,
      status: updated.status,
      items: updated.items.map((item) => ({
        productId: String(item.productId),
        quantity: item.quantity,
      })),
    };
  }
}
