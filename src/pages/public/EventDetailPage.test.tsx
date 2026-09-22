import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { CartProvider } from '../../context/CartContext';
import { EventDetailPage } from './EventDetailPage';

describe('EventDetailPage', () => {
  it('renders event details and tiers', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1', () =>
        HttpResponse.json({
          id: 'e1', title: 'Rock the Valley', description: 'A great show', venue: 'Ktm', startsAt: '2026-09-28T18:00:00Z', status: 'published',
          tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 }],
        })
      )
    );

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

    await waitFor(() => expect(screen.getByText('Rock the Valley')).toBeInTheDocument());
    expect(screen.getByText('General')).toBeInTheDocument();
  });
});
