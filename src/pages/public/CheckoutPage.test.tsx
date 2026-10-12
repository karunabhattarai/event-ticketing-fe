import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { CartProvider } from '../../context/CartContext';
import { CheckoutPage } from './CheckoutPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

function renderWithCart() {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider initialValue={{ eventId: 'e1', selections: { t1: 2 } }}>
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// server.resetHandlers() runs after every test (setup.ts), so this handler
// registration is shared here and re-applied via server.use() at the top of
// EACH test below — a handler added inside only one test does not survive
// into the next one, and MSW's onUnhandledRequest:'error' turns a missing
// handler into a hard failure rather than a silent pass-through.
function mockEventDetail() {
  server.use(
    http.get('http://localhost:3000/events/e1', () =>
      HttpResponse.json({
        id: 'e1', title: 'Rock the Valley', venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', description: 'd', status: 'published',
        tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 }],
      })
    )
  );
}

describe('CheckoutPage', () => {
  // The brief's original test file left `navigateMock` uncleared between
  // tests, so a navigate() call from an earlier test leaked into a later
  // test's `expect(navigateMock).not.toHaveBeenCalled()` assertion. Clearing
  // it here (scoped to this file only) fixes that without touching the
  // shared global setup.
  afterEach(() => {
    navigateMock.mockClear();
  });

  it('submits guest checkout and navigates to the payment page', async () => {
    mockEventDetail();
    server.use(
      http.post('http://localhost:3000/checkout', () =>
        HttpResponse.json({ id: 'order-1', accessToken: 'access-tok-1', status: 'pending', totalAmount: '1600', paymentMethod: 'redirect' }, { status: 201 })
      )
    );

    renderWithCart();

    await waitFor(() => expect(screen.getByText('Rock the Valley')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('Full name'), 'Jane Buyer');
    await userEvent.type(screen.getByPlaceholderText('Email address'), 'jane@example.com');
    await userEvent.click(screen.getByText('Continue to pay'));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/checkout/order-1/pay?method=redirect&token=access-tok-1'));
  });

  it('requires guest name and email when not logged in', async () => {
    mockEventDetail();
    renderWithCart();
    await waitFor(() => expect(screen.getByText('Rock the Valley', { exact: false })).toBeInTheDocument());
    await userEvent.click(screen.getByText('Continue to pay'));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('shows the server error when checkout is rejected (e.g. sold out)', async () => {
    mockEventDetail();
    server.use(
      http.post('http://localhost:3000/checkout', () =>
        HttpResponse.json({ error: 'Not enough tickets remaining for General' }, { status: 409 })
      )
    );

    renderWithCart();
    await waitFor(() => expect(screen.getByText('Rock the Valley')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('Full name'), 'Jane Buyer');
    await userEvent.type(screen.getByPlaceholderText('Email address'), 'jane@example.com');
    await userEvent.click(screen.getByText('Continue to pay'));

    expect(await screen.findByText('Not enough tickets remaining for General')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('blocks checkout with a message when the event has already taken place', async () => {
    server.use(
      http.get('http://localhost:3000/events/e1', () =>
        HttpResponse.json({
          id: 'e1', title: 'Old Show', venue: 'Ktm', startsAt: '2020-01-01T18:00:00Z', description: 'd', status: 'published',
          tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 0 }],
        })
      )
    );

    renderWithCart();

    expect(await screen.findByText(/already taken place/i)).toBeInTheDocument();
    expect(screen.queryByText('Continue to pay')).not.toBeInTheDocument();
  });
});
