import { post } from '@/lib/api';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderShipping {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shipping: OrderShipping;
}

export interface CreateOrderResponse {
  success: true;
  orderId: string;
  message?: string;
}

/** Place order. Backend validates again and decrements stock. */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  return post<CreateOrderResponse>('/api/orders', payload);
}
