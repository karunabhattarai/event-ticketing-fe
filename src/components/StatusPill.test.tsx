import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('renders pending with amber styling', () => {
    render(<StatusPill status="pending" />);
    const pill = screen.getByText('Pending');
    expect(pill.className).toContain('amber');
  });

  it('renders paid with green styling', () => {
    render(<StatusPill status="paid" />);
    expect(screen.getByText('Paid').className).toContain('green');
  });

  it('renders fulfilled with green styling', () => {
    render(<StatusPill status="fulfilled" />);
    expect(screen.getByText('Fulfilled').className).toContain('green');
  });

  it('renders failed with red styling', () => {
    render(<StatusPill status="failed" />);
    expect(screen.getByText('Failed').className).toContain('red');
  });

  it('renders refunded with gray styling', () => {
    render(<StatusPill status="refunded" />);
    expect(screen.getByText('Refunded').className).toContain('gray');
  });
});
