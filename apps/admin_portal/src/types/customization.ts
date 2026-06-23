export interface Choice {
  _id: string;
  name: string;
  priceAdjustment: number | "";
   foodType?:string ;
  isDefault:boolean;
}
export interface Option {
  _id: string;
  name: string;
  type: string;
  required: boolean;
  priceType:"base" | "adjustment";
  choices: Choice[];
  isActive: boolean;
  isDeleted: boolean;
  customizationIsActive?:boolean;
}

export interface Customization {
  _id: string;
  customizationName: string;
  options: Option[];
}

export interface CustomizationPayload {
  _id:string;
  customizationName: string;
  options: Option[];
  createdAt: string;
  updatedAt:string;
  priceType:string;
  isActive: boolean;
  customizationIsActive:boolean;
}