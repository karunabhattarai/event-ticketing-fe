import { apiRequest } from '../lib/apiClient';
import type { TicketTier } from './events';

export function createTier(eventId: string, data: { name: string; price: number; quantityTotal: number }): Promise<TicketTier> {
  return apiRequest<TicketTier>(`/events/${eventId}/tiers`, { method: 'POST', body: JSON.stringify(data) });
}

export function updateTier(eventId: string, tierId: string, data: Partial<{ name: string; price: number; quantityTotal: number }>): Promise<TicketTier> {
  return apiRequest<TicketTier>(`/events/${eventId}/tiers/${tierId}`, { method: 'PATCH', body: JSON.stringify(data) });
}
