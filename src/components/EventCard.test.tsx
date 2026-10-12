import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EventCard } from './EventCard';
import type { Event } from '../api/events';

function baseEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'e1',
    title: 'Rock the Valley',
    description: 'd',
    venue: 'Ktm',
    startsAt: '2099-12-01T18:00:00Z',
    status: 'published',
    ...overrides,
  };
}

function renderCard(event: Event) {
  render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>
  );
}

describe('EventCard', () => {
  it('shows the lowest price among available tiers', () => {
    renderCard(
      baseEvent({
        tiers: [
          { id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 },
          { id: 't2', eventId: 'e1', name: 'VIP', price: '2000', currency: 'NPR', quantityTotal: 10, quantitySold: 0 },
        ],
      })
    );
    expect(screen.getByText('From Rs. 800')).toBeInTheDocument();
  });

  it('ignores a sold-out tier even if it is the cheapest', () => {
    renderCard(
      baseEvent({
        tiers: [
          { id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 100 },
          { id: 't2', eventId: 'e1', name: 'VIP', price: '2000', currency: 'NPR', quantityTotal: 10, quantitySold: 0 },
        ],
      })
    );
    expect(screen.getByText('From Rs. 2000')).toBeInTheDocument();
  });

  it('ignores a not-yet-on-sale tier even if it is the cheapest', () => {
    renderCard(
      baseEvent({
        tiers: [
          {
            id: 't1', eventId: 'e1', name: 'Early Bird', price: '500', currency: 'NPR', quantityTotal: 100, quantitySold: 0,
            salesStartAt: '2099-01-01T00:00:00Z',
          },
          { id: 't2', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 },
        ],
      })
    );
    expect(screen.getByText('From Rs. 800')).toBeInTheDocument();
  });

  it('shows no price when every tier is unavailable', () => {
    renderCard(
      baseEvent({
        tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 100 }],
      })
    );
    expect(screen.queryByText(/From Rs\./)).not.toBeInTheDocument();
  });
});
