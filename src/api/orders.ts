import { apiRequest } from '../lib/apiClient';
import type { Order } from './checkout';

export type OrderDetail = Omit<Order, 'items'> & {
  items: Array<{ id: string; ticketTierId: string; quantity: number; unitPrice: string; ticketTier: { name: string } }>;
  guestEmail?: string;
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

export type EventOrdersStats = {
  pending: number; paid: number; fulfilled: number; failed: number; refunded: number;
  ticketsIssued: number; ticketsCheckedIn: number;
};

export function listEventOrders(eventId: string): Promise<{ orders: OrderDetail[]; stats: EventOrdersStats }> {
  return apiRequest(`/events/${eventId}/orders`);
}

export function resendOrderEmail(eventId: string, orderId: string): Promise<void> {
  return apiRequest(`/events/${eventId}/orders/${orderId}/resend`, { method: 'POST' });
}

export function refundOrder(eventId: string, orderId: string): Promise<void> {
  return apiRequest(`/events/${eventId}/orders/${orderId}/refund`, { method: 'POST' });
}
