import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { MyOrdersPage } from './MyOrdersPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

describe('MyOrdersPage', () => {
  it('lists the buyer\'s orders', async () => {
    server.use(
      http.get('http://localhost:3000/buyer/orders', () =>
        HttpResponse.json([{ id: 'order-1', status: 'fulfilled', totalAmount: '1600', paymentMethod: 'redirect', items: [] }])
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyOrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Fulfilled')).toBeInTheDocument());
  });

  it('redirects to /login on a 401', async () => {
    server.use(http.get('http://localhost:3000/buyer/orders', () => HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyOrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });
});
