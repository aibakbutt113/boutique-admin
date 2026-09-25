export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  children?: Category[];
}

export interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric: string | null;
  price: number;
  salePrice: number | null;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category: Category;
  images: { id: string; url: string }[];
  variants: Variant[];
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string | null;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  status: string;
  paymentMethod: "COD" | "JAZZCASH" | "EASYPAISA";
  paymentStatus: string;
  paymentRef?: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shipName: string;
  shipPhone: string;
  shipLine1: string;
  shipCity: string;
  shipProvince: string;
  returnReason?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { name: string; email: string };
}
