import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { RedirectPaymentPage } from './RedirectPaymentPage';

beforeEach(() => {
  // jsdom doesn't implement navigation — stub the setter so we can assert on it
  delete (window as any).location;
  (window as any).location = { href: '' };
});

describe('RedirectPaymentPage', () => {
  it('redirects the browser to the Fonepay URL returned by the API', async () => {
    server.use(
      http.post('http://localhost:3000/payment/redirect/order-1/initiate', () =>
        HttpResponse.json({ url: 'https://dev-clientapi.fonepay.com/fake' })
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/checkout/order-1/pay']}>
          <Routes>
            <Route path="/checkout/:orderId/pay" element={<RedirectPaymentPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(window.location.href).toBe('https://dev-clientapi.fonepay.com/fake'));
  });

  it('shows an error and a way back when initiate fails', async () => {
    server.use(
      http.post('http://localhost:3000/payment/redirect/order-1/initiate', () =>
        HttpResponse.json({ error: 'Order is not pending payment' }, { status: 400 })
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/checkout/order-1/pay']}>
          <Routes>
            <Route path="/checkout/:orderId/pay" element={<RedirectPaymentPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Order is not pending payment')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('only initiates payment once even if the effect runs again with the same orderId/token', async () => {
    let initiateCallCount = 0;
    server.use(
      http.post('http://localhost:3000/payment/redirect/order-1/initiate', () => {
        initiateCallCount++;
        return HttpResponse.json({ url: 'https://dev-clientapi.fonepay.com/fake' });
      })
    );

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/checkout/order-1/pay']}>
          <Routes>
            <Route path="/checkout/:orderId/pay" element={<RedirectPaymentPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(window.location.href).toBe('https://dev-clientapi.fonepay.com/fake'));

    // Force a re-render (e.g. React StrictMode's double-invoke, or a parent
    // re-render) with the same orderId/token — the effect must not re-fire.
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/checkout/order-1/pay']}>
          <Routes>
            <Route path="/checkout/:orderId/pay" element={<RedirectPaymentPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(initiateCallCount).toBe(1);
  });
});
