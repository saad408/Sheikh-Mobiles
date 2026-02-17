import { post } from '@/lib/api';

export interface CheckoutValidateItem {
  id: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ValidatedItem {
  index: number;
  id: string;
  name: string;
  valid: boolean;
  error?: string;
  currentPrice?: number;
  quantity?: number;
  requestedQuantity?: number;
  selectedColor?: string;
  selectedSize?: string;
  availableQuantity?: number;
}

export interface CheckoutValidateResponse {
  valid: boolean;
  errors?: string[];
  validatedItems: ValidatedItem[];
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  total?: number;
}

/** Validate cart before checkout. Returns validation result and server-calculated totals. */
export async function validateCheckout(
  items: CheckoutValidateItem[]
): Promise<CheckoutValidateResponse> {
  return post<CheckoutValidateResponse>('/api/checkout/validate', { items });
}
