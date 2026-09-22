import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { DashboardPage } from './DashboardPage';

function mockDashboardData() {
  server.use(
    http.get('http://localhost:3000/events/mine', () =>
      HttpResponse.json([
        { id: 'e1', title: 'Rock the Valley', venue: 'Ktm', startsAt: '2026-09-28T18:00:00Z', description: 'd', status: 'published', tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 1000, quantitySold: 742 }] },
      ])
    ),
    http.get('http://localhost:3000/events/mine/stats', () =>
      HttpResponse.json({ ticketsSold: 1204, revenue: '842000', ticketsCheckedIn: 318 })
    )
  );
}

describe('DashboardPage', () => {
  it("lists the organizer's own events with status", async () => {
    mockDashboardData();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Rock the Valley')).toBeInTheDocument());
    expect(screen.getByText(/742/)).toBeInTheDocument();
    expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/organizer/events/e1/orders');
  });

  it('renders the stat tiles', async () => {
    mockDashboardData();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('1204')).toBeInTheDocument());
    expect(screen.getByText('318')).toBeInTheDocument();
    expect(screen.getByText(/842000/)).toBeInTheDocument();
  });
});
