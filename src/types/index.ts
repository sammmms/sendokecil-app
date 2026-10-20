export type OrderType = 'antar' | 'ambil';
export type PaymentMethod = 'TF' | 'CASH' | 'QRIS';
export type PaymentStatus = 'menunggu_pembayaran' | 'menunggu_konfirmasi' | 'lunas' | 'batal';
export type FulfillmentStatus = 'menunggu' | 'diproses' | 'siap' | 'selesai';
export type OrderPriority = 'normal' | 'high' | 'urgent';

export interface HPPComponent {
  id: string;
  name: string;
  category: 'bahan_baku' | 'kemasan' | 'operasional' | 'lainnya';
  cost: number; // in IDR
  unit: string; // e.g. "porsi", "pcs", "cup"
  note?: string;
}

export interface ProductRecipeItem {
  componentId: string;
  quantity: number; // multiplier e.g. 1
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  badge?: string;
  isAvailable: boolean;
  recipe: ProductRecipeItem[];
  customHpp?: number; // optional manual override
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  notes?: string;
  calculatedHpp?: number;
}

export interface GreetingCardData {
  recipientName: string;
  senderName: string;
  message: string;
  theme?: 'plain' | 'warm' | 'birthday' | 'minimalist';
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO String
  orderDate: string; // "13 Oct 2026" or "20 Okt 2026"
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress: string;
  deliveryTimeNote?: string;
  priority: OrderPriority;
  items: OrderItem[];
  totalPcs: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  totalHpp: number;
  netProfit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentProofUrl?: string; // base64 or upload path
  paymentProofUploadedAt?: string;
  paymentApprovedAt?: string;
  paymentApprovedBy?: string;
  customerNotes?: string;
  adminNotes?: string;
  greetingCard?: GreetingCardData;
}

export interface DestinationSummary {
  destination: string;
  orderCount: number;
  totalPcs: number;
  orders: Order[];
}

export interface StoreConfig {
  storeName: string;
  tagline: string;
  phone: string;
  bcaAccount: string;
  bcaHolder: string;
  qrisName: string;
}
