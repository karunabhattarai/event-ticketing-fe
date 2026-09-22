import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { CheckinPage } from './CheckinPage';

function renderPage() {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CheckinPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CheckinPage', () => {
  it('shows a valid result on a successful check-in', async () => {
    server.use(
      http.post('http://localhost:3000/tickets/GOOD-CODE/check-in', () =>
        HttpResponse.json({ result: 'valid', holderName: 'Jane D.', tierName: 'General' })
      )
    );

    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Ticket code'), 'GOOD-CODE');
    await userEvent.click(screen.getByText('Check in'));

    await waitFor(() => expect(screen.getByText(/valid ticket/i)).toBeInTheDocument());
    expect(screen.getByText(/Jane D\./)).toBeInTheDocument();
  });

  it('shows an already-checked-in message on a 409', async () => {
    server.use(
      http.post('http://localhost:3000/tickets/USED-CODE/check-in', () =>
        HttpResponse.json({ error: 'already_used' }, { status: 409 })
      )
    );

    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Ticket code'), 'USED-CODE');
    await userEvent.click(screen.getByText('Check in'));

    await waitFor(() => expect(screen.getByText(/already checked in/i)).toBeInTheDocument());
  });

  it('shows an invalid message on a 400', async () => {
    server.use(
      http.post('http://localhost:3000/tickets/BAD-CODE/check-in', () =>
        HttpResponse.json({ error: 'Invalid ticket code' }, { status: 400 })
      )
    );

    renderPage();
    await userEvent.type(screen.getByPlaceholderText('Ticket code'), 'BAD-CODE');
    await userEvent.click(screen.getByText('Check in'));

    await waitFor(() => expect(screen.getByText(/invalid ticket/i)).toBeInTheDocument());
  });
});
