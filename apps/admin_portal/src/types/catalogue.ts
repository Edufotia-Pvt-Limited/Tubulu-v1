export type Product_Display = 'Grid View' | 'List View';
export type Delivery_Type = 'Delivery' | 'Pick-up' | 'Dine-in' | 'Room-service';

export interface Catalogue {
  id: string;
  name: string;
  description: string;
  products: any[];
  displayType?: Product_Display;
  deliveryType?: Delivery_Type[];
  createdAt?: string;
  active: boolean;
  status: "In Progress" | "Completed" | "Failed" | "Active";
}
