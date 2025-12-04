import { IBase, IAddress } from '../common/base.types';

// =========================
// BILLING TYPES
// =========================

export interface IBilling extends IBase {
  userId: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: 'pending' | 'success' | 'failed';
  billingAddress: IAddress;
}
