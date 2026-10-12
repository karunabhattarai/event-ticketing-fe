import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TierPicker } from './TierPicker';

const tiers = [
  { id: 't1', eventId: 'e1', name: 'General', price: '800', currency: 'NPR', quantityTotal: 100, quantitySold: 98 },
  { id: 't2', eventId: 'e1', name: 'VIP', price: '2000', currency: 'NPR', quantityTotal: 10, quantitySold: 10 },
];

describe('TierPicker', () => {
  it('increments quantity on + click', async () => {
    const onChange = vi.fn();
    render(<TierPicker tiers={tiers} selections={{}} onChange={onChange} />);
    await userEvent.click(screen.getAllByText('+')[0]);
    expect(onChange).toHaveBeenCalledWith('t1', 1);
  });

  it('does not exceed remaining stock', async () => {
    const onChange = vi.fn();
    render(<TierPicker tiers={tiers} selections={{ t1: 2 }} onChange={onChange} />);
    // remaining for t1 is 100-98=2, already at 2 — + should be disabled
    const plusButtons = screen.getAllByText('+');
    expect(plusButtons[0]).toBeDisabled();
  });

  it('disables + and labels a sold-out tier', () => {
    render(<TierPicker tiers={tiers} selections={{}} onChange={vi.fn()} />);
    const plusButtons = screen.getAllByText('+');
    expect(plusButtons[1]).toBeDisabled(); // VIP is fully sold
    expect(screen.getByText(/Sold out/)).toBeInTheDocument();
  });

  it('decrements but never below 0', async () => {
    const onChange = vi.fn();
    render(<TierPicker tiers={tiers} selections={{ t1: 0 }} onChange={onChange} />);
    const minusButtons = screen.getAllByText('−');
    expect(minusButtons[0]).toBeDisabled();
  });
});
