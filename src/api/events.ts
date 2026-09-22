import { apiRequest } from '../lib/apiClient';

export type EventStatus = 'draft' | 'published' | 'cancelled';

export type TicketTier = {
  id: string;
  eventId: string;
  name: string;
  price: string;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
};

export type Event = {
  id: string;
  organizerId?: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  status: EventStatus;
  tiers?: TicketTier[];
};

export function listPublishedEvents(): Promise<Event[]> {
  return apiRequest<Event[]>('/events');
}

export function getEvent(id: string): Promise<Event> {
  return apiRequest<Event>(`/events/${id}`);
}

export function listMyEvents(): Promise<Event[]> {
  return apiRequest<Event[]>('/events/mine');
}

export function createEvent(data: { title: string; description: string; venue: string; startsAt: string }): Promise<Event> {
  return apiRequest<Event>('/events', { method: 'POST', body: JSON.stringify(data) });
}

export function updateEvent(id: string, data: Partial<{ title: string; description: string; venue: string; startsAt: string; status: EventStatus }>): Promise<Event> {
  return apiRequest<Event>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
