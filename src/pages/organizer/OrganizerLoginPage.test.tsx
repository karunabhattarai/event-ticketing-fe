import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { server } from '../../../tests/mocks/server';
import { queryClient } from '../../lib/queryClient';
import { OrganizerLoginPage } from './OrganizerLoginPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

describe('OrganizerLoginPage', () => {
  it('logs in and navigates to the dashboard on success', async () => {
    server.use(
      http.post('http://localhost:3000/organizer/auth/login', () =>
        HttpResponse.json({ id: 'o1', email: 'o@example.com', name: 'O' })
      )
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrganizerLoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await userEvent.type(screen.getByPlaceholderText('Email'), 'o@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(screen.getByText('Log in'));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/organizer'));
  });
});
