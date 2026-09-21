import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';
import { queryClient } from '../src/lib/queryClient';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  // Every page test imports the same module-level `queryClient` singleton
  // (Step 7 below) rather than constructing a fresh one per test — without
  // this, a query result cached under some key in one test (e.g.
  // ['order-status', 'order-1', 'tok-1']) is silently served to a later
  // test that renders the same route with the same params, instead of that
  // test's own MSW mock ever being hit.
  queryClient.clear();
});
afterAll(() => server.close());
