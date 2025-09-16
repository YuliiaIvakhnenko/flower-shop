export interface Shop {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

export interface Flower {
  _id: string;
  name: string;
  price: number;
  shopId: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Bouquet {
  _id: string;
  name: string;
  flowers: Flower[];
  price: number;
  shopId: string;   
  imageUrl?: string;
  createdAt: string;
  isFavorite?: boolean; 
}

export type ProductKind = "flower" | "bouquet";

export interface CartItem {
  productType: ProductKind;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}