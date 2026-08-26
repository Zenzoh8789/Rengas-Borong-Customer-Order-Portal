export interface ProductCategoryObject {
  id?: number;
  name: string;
}

export type ProductCategory = string | ProductCategoryObject;

export interface ProductUom {
  id: number;
  productId: number;
  name: string;
  price: number;
  pack: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  subtitle?: string;
  category: ProductCategory;
  imageUrl?: string | null;
  description?: string | null;
  rating?: number | null;
  uoms: ProductUom[];
}

export interface CartItem {
  product: Product;
  uom: ProductUom;
  quantity: number;
}

export type OrderStatus = "VIEW" | "MODIFIED" | "PRINTED";

export interface OrderCustomer {
  id?: number;
  name: string;
  companyName?: string;
  tinNumber?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
}

export interface OrderProduct {
  id: number;
  code: string;
  name: string;
  imageUrl?: string | null;
}

export interface OrderLine {
  id: number;
  quantity: number;
  unitPrice: number;
  amount?: number;
  product: OrderProduct;
}

export interface Order {
  id: number;
  orderNo: string;
  date: string;
  status: string;
  itemCount: number;
  total: number;

  customer?: {
    id?: number;
    name: string;
    companyName?: string;
    tinNumber?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    address?: string;
  };
}
