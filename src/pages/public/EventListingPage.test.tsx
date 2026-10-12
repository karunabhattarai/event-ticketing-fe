import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
          { id: '1', title: 'Rock the Valley', venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', description: 'd', status: 'published' },
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

  it('requests past events when the Past tab is clicked', async () => {
    server.use(
      http.get('http://localhost:3000/events', ({ request }) => {
        const when = new URL(request.url).searchParams.get('when');
        return HttpResponse.json(
          when === 'past'
            ? [{ id: '2', title: 'Old Show', venue: 'Ktm', startsAt: '2020-01-01T18:00:00Z', description: 'd', status: 'published' }]
            : [{ id: '1', title: 'Rock the Valley', venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', description: 'd', status: 'published' }]
        );
      })
    );

    renderPage();
    await waitFor(() => expect(screen.getByText('Rock the Valley')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Past'));
    await waitFor(() => expect(screen.getByText('Old Show')).toBeInTheDocument());
    expect(screen.queryByText('Rock the Valley')).not.toBeInTheDocument();
  });

  it('loads further pages when "Load more" is clicked, and hides it after the last page', async () => {
    const mk = (n: number, offset = 0) =>
      Array.from({ length: n }, (_, i) => ({
        id: `e${offset + i}`, title: `Event ${offset + i}`, venue: 'Ktm', startsAt: '2099-09-28T18:00:00Z', description: 'd', status: 'published',
      }));
    server.use(
      http.get('http://localhost:3000/events', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'));
        return HttpResponse.json(page === 1 ? mk(20) : mk(3, 20));
      })
    );

    renderPage();

    await waitFor(() => expect(screen.getByText('Event 0')).toBeInTheDocument());
    expect(screen.queryByText('Event 20')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));

    await waitFor(() => expect(screen.getByText('Event 22')).toBeInTheDocument());
    expect(screen.getByText('Event 0')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });
});
