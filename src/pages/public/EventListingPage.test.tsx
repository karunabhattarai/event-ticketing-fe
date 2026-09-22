import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { EventListingPage } from './EventListingPage';

function renderPage() {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EventListingPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('EventListingPage', () => {
  it('renders published events returned by the API', async () => {
    server.use(
      http.get('http://localhost:3000/events', () =>
        HttpResponse.json([
          { id: '1', title: 'Rock the Valley', venue: 'Ktm', startsAt: '2026-09-28T18:00:00Z', description: 'd', status: 'published' },
        ])
      )
    );

    renderPage();

    await waitFor(() => expect(screen.getByText('Rock the Valley')).toBeInTheDocument());
  });

  it('shows an empty state when there are no events', async () => {
    server.use(http.get('http://localhost:3000/events', () => HttpResponse.json([])));
    renderPage();
    await waitFor(() => expect(screen.getByText(/no events/i)).toBeInTheDocument());
  });
});
