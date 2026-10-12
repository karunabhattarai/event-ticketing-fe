import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { BuyerRegisterPage } from './BuyerRegisterPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

function renderPage() {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BuyerRegisterPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByPlaceholderText('Name'), 'Test User');
  await userEvent.type(screen.getByPlaceholderText('Email'), 'u@example.com');
  await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));
}

describe('BuyerRegisterPage', () => {
  it('registers and navigates to / on success', async () => {
    let body: unknown;
    server.use(
      http.post('http://localhost:3000/buyer/auth/register', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ id: 'u1', email: 'u@example.com', name: 'Test User' }, { status: 201 });
      })
    );

    renderPage();
    await fillAndSubmit();

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/'));
    expect(body).toEqual({ email: 'u@example.com', password: 'password123', name: 'Test User' });
  });

  it('shows the server error when the email is already registered', async () => {
    server.use(
      http.post('http://localhost:3000/buyer/auth/register', () => HttpResponse.json({ error: 'Email already registered' }, { status: 409 }))
    );

    renderPage();
    await fillAndSubmit();

    expect(await screen.findByText('Email already registered')).toBeInTheDocument();
  });
});
