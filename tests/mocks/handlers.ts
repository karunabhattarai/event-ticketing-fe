import { HttpHandler } from 'msw';

// Each later task appends its own handlers here via a named export,
// e.g. `export const eventHandlers = [...]`, and imports them into
// this array. Starts empty — Task 1 only wires up the MSW plumbing.
export const handlers: HttpHandler[] = [];
