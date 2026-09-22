import { describe, it, expect } from 'vitest';
import { HttpResponse, http } from 'msw';
import { server } from '../../tests/mocks/server';
import { apiRequest } from './apiClient';

describe('apiRequest', () => {
  it('sends X-Requested-With on every mutating request', async () => {
    // The backend rejects any non-GET/HEAD/OPTIONS request missing this
    // header with 403 (its CSRF defense) — MSW doesn't enforce it, so a
    // regression here would still pass every other MSW-mocked test.
    let receivedHeader: string | null = null;
    server.use(
      http.post('http://localhost:3000/probe', ({ request }) => {
        receivedHeader = request.headers.get('X-Requested-With');
        return HttpResponse.json({ ok: true });
      })
    );

    await apiRequest('/probe', { method: 'POST' });

    expect(receivedHeader).toBe('event-ticketing-frontend');
  });
});
