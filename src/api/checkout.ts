import { apiRequest } from '../lib/apiClient';

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'failed' | 'refunded';
export type PaymentMethod = 'redirect' | 'dynamic_qr';

export type OrderItem = { id: string; ticketTierId: string; quantity: number; unitPrice: string };

export type Order = {
  id: string;
  accessToken: string;
  status: OrderStatus;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  prn?: string;
  items?: OrderItem[];
};

export function createOrder(params: {
  items: { tierId: string; quantity: number }[];
  guestEmail?: string;
  guestName?: string;
  paymentMethod: PaymentMethod;
}): Promise<Order> {
  return apiRequest<Order>('/checkout', { method: 'POST', body: JSON.stringify(params) });
}
