export interface Admin {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
}

export interface MediaRef {
  id: string;
  url: string;
  thumbnail_url: string | null;
  small_url: string | null;
  medium_url: string | null;
  large_url: string | null;
  alt_text: string | null;
  caption: string | null;
  mime_type: string;
  file_type: string;
  width: number | null;
  height: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  children?: Category[];
  products?: Product[];
}

export interface ProductMedia {
  id: string;
  media_id: string;
  media: MediaRef;
  is_primary: boolean;
  is_video: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  cost: number | null;
  stock_quantity: number;
  sku: string | null;
  category_id: string | null;
  category?: Category | null;
  status: string;
  media: ProductMedia[];
  created_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content_html: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: MediaRef | null;
  mobile_image: MediaRef | null;
  link_url: string | null;
  link_text: string | null;
  position: string;
  is_active: boolean;
  sort_order: number;
}

export interface CartItem {
  id?: string;
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  sku?: string;
  slug: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address_snapshot: string | null;
  total_amount: number;
  payment_method: string;
  order_status: string;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
}
