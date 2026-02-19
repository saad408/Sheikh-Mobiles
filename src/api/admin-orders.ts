import { get, put } from '@/lib/api';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
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

export interface OrderPayment {
  last4: string;
  expiry: string;
  name: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  orderId: string;
  shipping: OrderShipping;
  payment: OrderPayment;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    recordsOnPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    summary: string;
  };
}

export interface OrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UpdateStatusResponse {
  success: true;
  orderId: string;
  status: string;
  updatedAt: string;
}

export async function fetchOrders(
  token: string,
  params: OrdersParams = {}
): Promise<OrdersResponse> {
  return get<OrdersResponse>('/api/admin/orders', params, {
    headers: authHeaders(token),
  });
}

export async function fetchOrderById(
  token: string,
  orderId: string
): Promise<Order> {
  return get<Order>(`/api/admin/orders/${encodeURIComponent(orderId)}`, {}, {
    headers: authHeaders(token),
  });
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: Order['status']
): Promise<UpdateStatusResponse> {
  return put<UpdateStatusResponse>(
    `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
    { status },
    { headers: authHeaders(token) }
  );
}
