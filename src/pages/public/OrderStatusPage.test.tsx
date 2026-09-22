import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { OrderStatusPage } from './OrderStatusPage';

function renderAt(path: string) {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/order/:orderId/status" element={<OrderStatusPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('OrderStatusPage', () => {
  it('shows pending status', async () => {
    server.use(
      http.get('http://localhost:3000/orders/order-1', () =>
        HttpResponse.json({ id: 'order-1', status: 'pending', totalAmount: '800', paymentMethod: 'redirect', items: [] })
      )
    );
    renderAt('/order/order-1/status?token=tok-1');
    await waitFor(() => expect(screen.getByText('Pending')).toBeInTheDocument());
  });

  it('shows a "try again" link for a failed order', async () => {
    server.use(
      http.get('http://localhost:3000/orders/order-1', () =>
        HttpResponse.json({ id: 'order-1', status: 'failed', totalAmount: '800', paymentMethod: 'redirect', items: [] })
      )
    );
    renderAt('/order/order-1/status?token=tok-1');
    await waitFor(() => expect(screen.getByText(/try again/i)).toBeInTheDocument());
  });

  it('shows an explicit message when the token is missing from the URL', () => {
    renderAt('/order/order-1/status');
    expect(screen.getByText(/missing its access token/i)).toBeInTheDocument();
  });

  it('shows an error message when the order lookup fails (e.g. wrong token)', async () => {
    server.use(http.get('http://localhost:3000/orders/order-1', () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 })));
    renderAt('/order/order-1/status?token=wrong-token');
    await waitFor(() => expect(screen.getByText(/couldn't find this order/i)).toBeInTheDocument());
  });
});
