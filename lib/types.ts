export interface Vendor {
  id: string;
  user_id: string;
  slug: string;
  shop_name: string;
  whatsapp_number: string;
  bio: string;
  logo_url: string | null;
  delivery_fee: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  vendor_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  note: string;
  items: { id: string; name: string; price: number; qty: number }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: "new" | "confirmed" | "delivered" | "cancelled";
  payment_status: "unpaid" | "paid";
  payment_reference: string | null;
  created_at: string;
}
