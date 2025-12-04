// =========================
// COMMON BASE INTERFACES
// =========================

export interface IBase {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

// =========================
// ADDRESS TYPE
// =========================

export interface IAddress {
  label?: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}
