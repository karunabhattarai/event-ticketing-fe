import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { DynamicQrPaymentPage } from './DynamicQrPaymentPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

function renderPage() {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/checkout/order-1/pay?method=dynamic_qr&token=qr-tok-1']}>
        <Routes>
          <Route path="/checkout/:orderId/pay" element={<DynamicQrPaymentPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DynamicQrPaymentPage', () => {
  it('shows the QR image once generated', async () => {
    server.use(
      http.post('http://localhost:3000/payment/dynamic-qr/order-1/generate', () =>
        HttpResponse.json({ qrImageDataUrl: 'data:image/png;base64,ZmFrZQ==', expiresInSeconds: 900 })
      ),
      http.get('http://localhost:3000/payment/dynamic-qr/order-1/status', () => HttpResponse.json({ status: 'pending' }))
    );

    renderPage();
    await waitFor(() => expect(screen.getByAltText(/qr code/i)).toBeInTheDocument());
  });

  it('navigates to the confirmation page once status becomes paid', async () => {
    let pollCount = 0;
    server.use(
      http.post('http://localhost:3000/payment/dynamic-qr/order-1/generate', () =>
        HttpResponse.json({ qrImageDataUrl: 'data:image/png;base64,ZmFrZQ==', expiresInSeconds: 900 })
      ),
      http.get('http://localhost:3000/payment/dynamic-qr/order-1/status', () => {
        pollCount++;
        return HttpResponse.json({ status: pollCount < 2 ? 'pending' : 'paid' });
      })
    );

    renderPage();
    await waitFor(
      () => expect(navigateMock).toHaveBeenCalledWith('/order/order-1/confirmation?token=qr-tok-1', { state: { accessToken: 'qr-tok-1' } }),
      { timeout: 10000 }
    );
  });

  it('navigates to the confirmation page when status becomes fulfilled (not just paid)', async () => {
    // The backend runs fulfillOrder synchronously as part of settling the order, so
    // the poll response usually observes 'fulfilled' directly rather than 'paid'.
    let pollCount = 0;
    server.use(
      http.post('http://localhost:3000/payment/dynamic-qr/order-1/generate', () =>
        HttpResponse.json({ qrImageDataUrl: 'data:image/png;base64,ZmFrZQ==', expiresInSeconds: 900 })
      ),
      http.get('http://localhost:3000/payment/dynamic-qr/order-1/status', () => {
        pollCount++;
        return HttpResponse.json({ status: pollCount < 2 ? 'pending' : 'fulfilled' });
      })
    );

    renderPage();
    await waitFor(
      () => expect(navigateMock).toHaveBeenCalledWith('/order/order-1/confirmation?token=qr-tok-1', { state: { accessToken: 'qr-tok-1' } }),
      { timeout: 10000 }
    );
  });

  it('shows a failed state with a retry link when status becomes failed', async () => {
    server.use(
      http.post('http://localhost:3000/payment/dynamic-qr/order-1/generate', () =>
        HttpResponse.json({ qrImageDataUrl: 'data:image/png;base64,ZmFrZQ==', expiresInSeconds: 900 })
      ),
      http.get('http://localhost:3000/payment/dynamic-qr/order-1/status', () => HttpResponse.json({ status: 'failed' }))
    );

    renderPage();
    await waitFor(() => expect(screen.getByText(/payment failed/i)).toBeInTheDocument());
  });
});
