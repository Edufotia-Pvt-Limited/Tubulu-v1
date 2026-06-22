// export interface Deal {
//   _id: string;
//   name: string;
//   description: string;
//   offerType: "PERCENTAGE" | "FLAT" | "BUY_X_GET_Y";
//   discountValue?: number;

//   startDate: string;
//   endDate: string;

//   isDealOfTheDay: boolean;

//   buyQuantity?: number;
//   getQuantity?: number;

//   minOrderValue?: number;
//   maxDiscount?: number;

//   isActive: boolean;

//   usageLimit?: number;
//   perUserLimit?: number;

//   isDeleted: boolean; // corrected spelling
// }


export interface Deal {
  _id: string;
  name: string;

  // Backend sends array of descriptions
  descriptions: string[];

  discountType: "percentage" | "flat" | "bogo";
  discountValue?: number;

  couponCode?: string;

  buyQuantity?: number;
  getQuantity?: number;

  startDate: string;
  endDate: string;

  minOrderValue?: number | null;
  maxDiscount?: number | null;

  usageLimit?: number | null;
  perUserLimit?: number | null;
  usageCount?: number;

  isDealOfTheDay: boolean;
  isActive: boolean;
  isDeleted: boolean;

  createdAt?: string;
  updatedAt?: string;
}
