import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { EventOrdersPage } from './EventOrdersPage';

function renderPage() {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/organizer/events/e1/orders']}>
        <Routes>
          <Route path="/organizer/events/:id/orders" element={<EventOrdersPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('EventOrdersPage', () => {
  it('lists orders with stats', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1/orders', () =>
        HttpResponse.json({
          orders: [{ id: 'order-1', status: 'fulfilled', totalAmount: '3600', paymentMethod: 'redirect', guestEmail: 'jane@example.com', items: [] }],
          stats: { pending: 0, paid: 0, fulfilled: 1, failed: 0, refunded: 0, ticketsIssued: 3, ticketsCheckedIn: 0 },
        })
      )
    );

    renderPage();

    await waitFor(() => expect(screen.getByText('jane@example.com')).toBeInTheDocument());
    expect(screen.getByText(/1 fulfilled/i)).toBeInTheDocument();
  });

  it('resends the ticket email on click', async () => {
    let resendCalled = false;
    server.use(
      http.get('http://localhost:3000/events/e1/orders', () =>
        HttpResponse.json({
          orders: [{ id: 'order-1', status: 'fulfilled', totalAmount: '3600', paymentMethod: 'redirect', guestEmail: 'jane@example.com', items: [] }],
          stats: { pending: 0, paid: 0, fulfilled: 1, failed: 0, refunded: 0, ticketsIssued: 3, ticketsCheckedIn: 0 },
        })
      ),
      http.post('http://localhost:3000/events/e1/orders/order-1/resend', () => {
        resendCalled = true;
        return HttpResponse.json({ ok: true });
      })
    );

    renderPage();
    await waitFor(() => expect(screen.getByText('jane@example.com')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Resend'));
    await waitFor(() => expect(resendCalled).toBe(true));
  });

  it('only disables the acted-on row while refund/resend is pending, not every row', async () => {
    let resolveRefund: () => void = () => {};
    const refundStarted = new Promise<void>((resolve) => {
      server.use(
        http.get('http://localhost:3000/events/e1/orders', () =>
          HttpResponse.json({
            orders: [
              { id: 'order-1', status: 'fulfilled', totalAmount: '3600', paymentMethod: 'redirect', guestEmail: 'a@example.com', items: [] },
              { id: 'order-2', status: 'fulfilled', totalAmount: '1800', paymentMethod: 'redirect', guestEmail: 'b@example.com', items: [] },
            ],
            stats: { pending: 0, paid: 0, fulfilled: 2, failed: 0, refunded: 0, ticketsIssued: 3, ticketsCheckedIn: 0 },
          })
        ),
        http.post('http://localhost:3000/events/e1/orders/order-1/refund', async () => {
          resolve();
          await new Promise<void>((r) => (resolveRefund = r));
          return HttpResponse.json({ ok: true });
        })
      );
    });

    renderPage();
    await waitFor(() => expect(screen.getByText('a@example.com')).toBeInTheDocument());

    const refundButtons = screen.getAllByText('Refund');
    await userEvent.click(refundButtons[0]);
    await refundStarted;

    expect(refundButtons[0]).toBeDisabled();
    expect(refundButtons[1]).not.toBeDisabled();

    resolveRefund();
  });
});
