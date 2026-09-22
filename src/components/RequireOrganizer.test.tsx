import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../tests/mocks/server';
import { queryClient } from '../lib/queryClient';
import { RequireOrganizer } from './RequireOrganizer';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

describe('RequireOrganizer', () => {
  it('renders children when authenticated', async () => {
    server.use(http.get('http://localhost:3000/events/mine', () => HttpResponse.json([])));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequireOrganizer>
            <div>Protected content</div>
          </RequireOrganizer>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Protected content')).toBeInTheDocument());
  });

  it('redirects to /organizer/login on a 401', async () => {
    server.use(http.get('http://localhost:3000/events/mine', () => HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequireOrganizer>
            <div>Protected content</div>
          </RequireOrganizer>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/organizer/login'));
  });
});
