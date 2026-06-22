
export interface CartItem {
  _id : string 
  productId: string;
  choiceNames : string[]
  name: string;
  price: number;
  total: number;
  oldPrice?: number;
  quantity: number;
  syncing?: boolean;      
  syncError?: string;     
   product : {
    name : string
    price : number
    foodType: "Veg" | "Non Veg" | "Egg" | string
  };
}

export interface deal  {
alreadyApplied : boolean
calculatedDiscount : string
dealId : string
dealName :string
isDefault : boolean
isEligible: boolean
couponType : "store_coupon" | "payment_coupon"
}

export interface tax {
cgst :string
otherTaxes : string
sgst : string
}

export interface Cart {
    integrationId : string
    cartId: string
    deals : deal[]
    catalogueId : string
    cart : CartItem[]
    totalQuantity : number
    deliveryType: string[]
    totalPrice : number
    itemsTotal : string
    taxes: tax
    totalSaved:string
    billPrice : string
}

export interface ICartState {
    carts : Record<string, Cart> 
    activeIntegrationId?: string;
    loading: boolean;
    error?: string;
}

export const defaultCartState: ICartState = {
  carts: {},
  activeIntegrationId: undefined,
  loading: false,
  error: undefined,
};