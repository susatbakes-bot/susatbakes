export type BoxOption = {
  label: string;
  size: number;
  price: number;
};

export type FlavorOption = {
  name: string;
  price: number;
  description?: string;
};

export type BakeryProduct = {
  id: string;
  name: string;
  category: 'Brownies' | 'Cookies' | 'Muffins & Breads' | string;
  categorySlug?: string;
  emoji: string;
  description: string;
  tag?: string;
  imageUrl?: string;
  basePrice?: number;
  boxOptions?: BoxOption[];
  genericFlavors?: string[];
  flavors?: FlavorOption[];
  fixedPrice?: number;
  fixedVariant?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  category: string;
  variant: string;
  flavor?: string;
  price: number;
  quantity: number;
  customNote?: string;
  emoji?: string;
  imageUrl?: string;
};

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type Order = {
  id: string;
  date: string;
  slot: string;
  customer: OrderCustomer;
  items: CartItem[];
  total: number;
  paymentType: 'whatsapp' | 'jazzcash';
  proofUrl?: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Baking' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
};
