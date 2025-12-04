import { IBase, IAddress } from '../common/base.types';

// =========================
// CATEGORY
// =========================

export interface ICategory extends IBase {
  name: string;
  description?: string;
  image?: string;
}

// =========================
// PRODUCT
// =========================

export interface IProduct extends IBase {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  weight: number;
  isFeatured?: boolean;
}

// =========================
// INVENTORY
// =========================

export interface IInventory extends IBase {
  productId: string;
  totalStock: number;
  sold: number;
  remainingStock: number;
  batches?: IInventoryBatch[];
}

export interface IInventoryBatch {
  batchNo: string;
  quantity: number;
  expiryDate?: Date;
  manufacturedDate?: Date;
}

// =========================
// CART
// =========================

export interface ICartItem {
  productId: string;
  quantity: number;
}

export interface ICart extends IBase {
  userId: string;
  items: ICartItem[];
  totalAmount: number;
}

// =========================
// ORDER
// =========================

export interface IOrder extends IBase {
  userId: string;
  items: IOrderItem[];
  address: IAddress;
  payment: IPaymentDetails;
  status: IOrderStatus;
  totalAmount: number;
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type IOrderStatus =
  | 'pending'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// =========================
// PAYMENT DETAILS
// =========================

export interface IPaymentDetails {
  method: 'cod' | 'upi' | 'card' | 'netbanking';
  transactionId?: string;
  status: 'success' | 'failed' | 'pending';
}

// =========================
// REVIEWS
// =========================

export interface IReview extends IBase {
  userId: string;
  productId: string;
  rating: number;
  review: string;
}

// =========================
// FEEDBACK
// =========================

export interface IFeedback extends IBase {
  name: string;
  email: string;
  phone: string;
  message: string;
}
