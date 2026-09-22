import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { BuyerLoginPage } from './BuyerLoginPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

describe('BuyerLoginPage', () => {
  it('logs in and navigates home on success', async () => {
    server.use(
      http.post('http://localhost:3000/buyer/auth/login', () =>
        HttpResponse.json({ id: 'b1', email: 'b@example.com', name: 'B' })
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BuyerLoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await userEvent.type(screen.getByPlaceholderText('Email'), 'b@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/'));
  });

  it('shows an error message on invalid credentials', async () => {
    server.use(
      http.post('http://localhost:3000/buyer/auth/login', () => HttpResponse.json({ error: 'Invalid email or password' }, { status: 401 }))
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BuyerLoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await userEvent.type(screen.getByPlaceholderText('Email'), 'b@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
