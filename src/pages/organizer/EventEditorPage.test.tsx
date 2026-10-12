import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { EventEditorPage } from './EventEditorPage';

describe('EventEditorPage', () => {
  it('creates a new event on submit when there is no :id param', async () => {
    server.use(
      http.post('http://localhost:3000/events', () =>
        HttpResponse.json({ id: 'e-new', title: 'New Show', description: 'd', venue: 'v', startsAt: '2099-12-01T18:00:00Z', status: 'draft' }, { status: 201 })
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organizer/events/new']}>
          <Routes>
            <Route path="/organizer/events/new" element={<EventEditorPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await userEvent.type(screen.getByPlaceholderText('Event title'), 'New Show');
    await userEvent.type(screen.getByPlaceholderText('Venue'), 'v');
    await userEvent.type(screen.getByLabelText('Event date and time'), '2099-12-01T18:00');
    await userEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText(/saved/i)).toBeInTheDocument());
  });

  it('publishes an existing draft event', async () => {
    server.use(
      http.get('http://localhost:3000/events/mine', () =>
        HttpResponse.json([
          { id: 'e1', title: 'X', description: 'd', venue: 'v', startsAt: '2099-12-01T18:00:00Z', status: 'draft', tiers: [] },
        ])
      ),
      http.patch('http://localhost:3000/events/e1', async ({ request }) => {
        const body = (await request.json()) as { status: string };
        expect(body.status).toBe('published');
        return HttpResponse.json({ id: 'e1', title: 'X', description: 'd', venue: 'v', startsAt: '2099-12-01T18:00:00Z', status: 'published' });
      })
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organizer/events/e1/edit']}>
          <Routes>
            <Route path="/organizer/events/:id/edit" element={<EventEditorPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByDisplayValue('X')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Published'));
    await userEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByText(/saved/i)).toBeInTheDocument());
  });

  it('loads and displays existing tiers when editing an event', async () => {
    // The component fetches GET /events/mine, not GET /events/:id — the
    // public single-event endpoint only returns published events (backend
    // Task 9), and this event is a draft, so the editor uses the organizer's
    // own event list instead (see this task's plan note above).
    server.use(
      http.get('http://localhost:3000/events/mine', () =>
        HttpResponse.json([
          { id: 'e1', title: 'X', description: 'd', venue: 'v', startsAt: '2099-12-01T18:00:00Z', status: 'draft', tiers: [{ id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 12 }] },
        ])
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organizer/events/e1/edit']}>
          <Routes>
            <Route path="/organizer/events/:id/edit" element={<EventEditorPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('General')).toBeInTheDocument());
  });

  it('disables + Add until the tier form has a name and a valid positive price and quantity', async () => {
    server.use(
      http.get('http://localhost:3000/events/mine', () =>
        HttpResponse.json([
          { id: 'e1', title: 'X', description: 'd', venue: 'v', startsAt: '2099-12-01T18:00:00Z', status: 'draft', tiers: [] },
        ])
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organizer/events/e1/edit']}>
          <Routes>
            <Route path="/organizer/events/:id/edit" element={<EventEditorPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByPlaceholderText('Name')).toBeInTheDocument());
    const addButton = screen.getByText('+ Add');
    expect(addButton).toBeDisabled(); // all fields empty

    await userEvent.type(screen.getByPlaceholderText('Name'), 'General');
    await userEvent.type(screen.getByPlaceholderText('Price'), 'abc');
    await userEvent.type(screen.getByPlaceholderText('Quantity'), '10');
    expect(addButton).toBeDisabled(); // non-numeric price

    await userEvent.clear(screen.getByPlaceholderText('Price'));
    await userEvent.type(screen.getByPlaceholderText('Price'), '800');
    expect(addButton).not.toBeDisabled();
  });
});
