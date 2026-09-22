import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { OrderConfirmationPage } from './OrderConfirmationPage';

function mockOrderDetail() {
  server.use(
    http.get('http://localhost:3000/orders/order-1', ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get('token')).toBe('secret-token');
      return HttpResponse.json({
        id: 'order-1', status: 'fulfilled', totalAmount: '1600', paymentMethod: 'redirect',
        items: [{ id: 'oi1', ticketTierId: 't1', quantity: 2, unitPrice: '800', ticketTier: { name: 'General' } }],
      });
    })
  );
}

function renderConfirmed() {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/order/order-1/confirmation', state: { accessToken: 'secret-token' } }]}>
        <Routes>
          <Route path="/order/:orderId/confirmation" element={<OrderConfirmationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('OrderConfirmationPage', () => {
  it('renders ticket summary when an access token is present in router state', async () => {
    mockOrderDetail();
    renderConfirmed();

    await waitFor(() => expect(screen.getByText(/you're going/i)).toBeInTheDocument());
    expect(screen.getByText(/General/)).toBeInTheDocument();
  });

  it('resends the confirmation email on click', async () => {
    mockOrderDetail();
    let resendCalled = false;
    server.use(
      http.post('http://localhost:3000/orders/order-1/resend', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('token')).toBe('secret-token');
        resendCalled = true;
        return HttpResponse.json({ ok: true });
      })
    );

    renderConfirmed();
    await waitFor(() => expect(screen.getByText(/you're going/i)).toBeInTheDocument());
    await userEvent.click(screen.getByText('Resend email'));

    await waitFor(() => expect(resendCalled).toBe(true));
    expect(await screen.findByText('Email sent')).toBeInTheDocument();
  });

  it('shows a fallback link to the status page when no access token is in state', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/order/order-1/confirmation']}>
          <Routes>
            <Route path="/order/:orderId/confirmation" element={<OrderConfirmationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/view your order/i)).toBeInTheDocument();
  });
});
