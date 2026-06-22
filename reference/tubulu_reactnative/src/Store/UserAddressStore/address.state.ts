
export interface Address {
  _id?: string; 
  fullName: string;
  contact: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  addressType: string;
  isDefault?: boolean;
  isDeleted?: boolean;
  addressLabel?: string
  customLabel?: string
}

export interface UserAddresses {
  addresses: Address[]; 
}

export interface AddressState {
  addresses: Address[]; 
  loading: boolean;
  error?: string;
}

export const defaultAddressState: AddressState = {
  addresses: [],
  loading: false,
  error: undefined,
};



