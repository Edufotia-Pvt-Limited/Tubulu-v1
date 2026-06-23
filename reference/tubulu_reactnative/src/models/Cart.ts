export interface Deal {
  dealId: string;
  dealName: string;
  
  descriptions: string[];
  
  discountType: "percentage" | "flat" | string; // extend if needed
  
  couponType: "store_coupon" | "item_coupon";
  
  couponCode: string;
  
  isEligible: boolean;
  isDefault: boolean;
  alreadyApplied: boolean;
  
  calculatedDiscount: string; // or number if you want numeric
}
