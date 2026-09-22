import { apiRequest } from '../lib/apiClient';
import type { Order } from './checkout';

export type OrderDetail = Omit<Order, 'items'> & {
  items: Array<{ id: string; ticketTierId: string; quantity: number; unitPrice: string; ticketTier: { name: string } }>;
};

export function getOrderStatus(orderId: string, token: string): Promise<OrderDetail> {
  return apiRequest<OrderDetail>(`/orders/${orderId}?token=${encodeURIComponent(token)}`);
}

export function resendOrderConfirmationEmail(orderId: string, token: string): Promise<void> {
  return apiRequest(`/orders/${orderId}/resend?token=${encodeURIComponent(token)}`, { method: 'POST' });
}

export function listMyOrders(): Promise<OrderDetail[]> {
  return apiRequest<OrderDetail[]>('/buyer/orders');
}
