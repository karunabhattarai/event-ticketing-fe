import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { CartProvider } from '../../context/CartContext';
import { EventDetailPage } from './EventDetailPage';

function renderDetail() {
  render(
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <MemoryRouter initialEntries={['/events/e1']}>
          <Routes>
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

describe('EventDetailPage', () => {
  it('renders event details and tiers', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1', () =>
        HttpResponse.json({
          id: 'e1', title: 'Rock the Valley', description: 'A great show', venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', status: 'published',
          tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 }],
        })
      )
    );

    renderDetail();

    await waitFor(() => expect(screen.getByText('Rock the Valley')).toBeInTheDocument());
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('shows an error message instead of spinning forever when the event cannot be loaded', async () => {
    server.use(http.get('http://localhost:3000/events/e1', () => HttpResponse.json({ error: 'Not found' }, { status: 404 })));

    renderDetail();

    expect(await screen.findByText(/couldn't find this event/i)).toBeInTheDocument();
  });

  it('disables Get tickets and shows a past-event message once startsAt has passed', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1', () =>
        HttpResponse.json({
          id: 'e1', title: 'Old Show', description: 'It happened', venue: 'Ktm', startsAt: '2020-01-01T18:00:00Z', status: 'published',
          tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 }],
        })
      )
    );

    renderDetail();

    await waitFor(() => expect(screen.getByText('Old Show')).toBeInTheDocument());
    expect(screen.getByText(/already taken place/i)).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Get tickets')).toBeDisabled();
  });

  it('disables Get tickets and shows a message when every tier is sold out', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1', () =>
        HttpResponse.json({
          id: 'e1', title: 'Packed Show', description: 'Full house', venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', status: 'published',
          tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 100 }],
        })
      )
    );

    renderDetail();

    await waitFor(() => expect(screen.getByText('Packed Show')).toBeInTheDocument());
    expect(screen.getByText(/no tickets are currently available/i)).toBeInTheDocument();
    expect(screen.getByText('Get tickets')).toBeDisabled();
  });

  it('disables a tier whose sales window has not started yet, but leaves other tiers buyable', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1', () =>
        HttpResponse.json({
          id: 'e1', title: 'Mixed Tiers Show', description: 'd', venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', status: 'published',
          tiers: [
            { id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 },
            {
              id: 't2', eventId: 'e1', name: 'Early Bird', price: '500', currency: 'NPR', quantityTotal: 50, quantitySold: 0,
              salesStartAt: '2099-01-01T00:00:00Z',
            },
          ],
        })
      )
    );

    renderDetail();

    await waitFor(() => expect(screen.getByText('Mixed Tiers Show')).toBeInTheDocument());
    expect(screen.getByText(/not yet on sale/i)).toBeInTheDocument();
    const plusButtons = screen.getAllByText('+');
    expect(plusButtons[1]).toBeDisabled(); // Early Bird
    expect(plusButtons[0]).not.toBeDisabled(); // General still buyable
  });

  it('disables Get tickets when the only tier is past its sales end date', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1', () =>
        HttpResponse.json({
          id: 'e1', title: 'Last Call Show', description: 'd', venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', status: 'published',
          tiers: [
            {
              id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0,
              salesEndAt: '2020-01-01T00:00:00Z',
            },
          ],
        })
      )
    );

    renderDetail();

    await waitFor(() => expect(screen.getByText('Last Call Show')).toBeInTheDocument());
    expect(screen.getByText(/sales ended/i)).toBeInTheDocument();
    expect(screen.getByText('Get tickets')).toBeDisabled();
  });
});
