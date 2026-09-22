import { Card } from './ui/card';
import type { Event } from '../api/events';

export function CartSummary({ event, selections }: { event: Event; selections: Record<string, number> }) {
  const lines = (event.tiers ?? [])
    .filter((t) => (selections[t.id] ?? 0) > 0)
    .map((t) => ({ tier: t, quantity: selections[t.id] }));

  const total = lines.reduce((sum, l) => sum + Number(l.tier.price) * l.quantity, 0);

  return (
    <Card>
      <div className="mb-3 text-sm font-bold">{event.title}</div>
      <div className="mb-3 text-xs text-muted">
        {new Date(event.startsAt).toLocaleDateString()} · {event.venue}
      </div>
      {lines.map((l) => (
        <div key={l.tier.id} className="flex justify-between py-1.5 text-sm">
          <span>{l.tier.name} × {l.quantity}</span>
          <span>Rs. {Number(l.tier.price) * l.quantity}</span>
        </div>
      ))}
      <div className="mt-2.5 flex justify-between border-t border-border pt-2.5 text-base font-bold">
        <span>Total</span>
        <span>Rs. {total}</span>
      </div>
    </Card>
  );
}
