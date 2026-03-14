import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}

@Schema({ _id: false })
class ShippingAddress {
  @Prop({ trim: true })
  name?: string;

  @Prop({ trim: true })
  address1?: string;

  @Prop({ trim: true })
  address2?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  postalCode?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  phone?: string;
}

@Schema({ timestamps: true, versionKey: false, collection: 'orders' })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  @Prop({ type: ShippingAddress })
  shipping?: ShippingAddress;

  @Prop({ required: true, enum: ['card', 'paypal', 'apple'] })
  paymentMethod: 'card' | 'paypal' | 'apple';

  @Prop({
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  })
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  @Prop()
  transactionId?: string;

  @Prop()
  paidAt?: Date;

  @Prop({ required: true })
  total: number;

  @Prop({
    required: true,
    enum: ['Processing', 'In Transit', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing',
  })
  status: 'Processing' | 'In Transit' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export const OrderSchema = SchemaFactory.createForClass(Order);
