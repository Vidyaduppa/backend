import { IBase, IAddress } from '../common/base.types';

// =========================
// USER & AUTH TYPES
// =========================

export interface IUser extends IBase {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'admin';
  addresses?: IAddress[];
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}
