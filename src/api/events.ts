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
  salesStartAt?: string | null;
  salesEndAt?: string | null;
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

export const EVENTS_PAGE_SIZE = 20;

export function listPublishedEvents(when: 'upcoming' | 'past' = 'upcoming', page = 1): Promise<Event[]> {
  return apiRequest<Event[]>(`/events?when=${when}&page=${page}&pageSize=${EVENTS_PAGE_SIZE}`);
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

export function getOrganizerStats(): Promise<{ ticketsSold: number; revenue: string; ticketsCheckedIn: number }> {
  return apiRequest('/events/mine/stats');
}
