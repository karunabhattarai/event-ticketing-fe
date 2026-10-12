import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import type { Event } from '../api/events';

export function EventCard({ event }: { event: Event }) {
  const date = new Date(event.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const now = new Date();
  // Only advertise a price for tiers you could actually buy right now — a sold-out
  // or not-yet/no-longer-on-sale tier being the cheapest would otherwise show a
  // price nothing currently purchasable actually offers.
  const availableTiers = (event.tiers ?? []).filter((t) => {
    const notYetOnSale = !!t.salesStartAt && new Date(t.salesStartAt) > now;
    const salesEnded = !!t.salesEndAt && new Date(t.salesEndAt) < now;
    return !notYetOnSale && !salesEnded && t.quantityTotal - t.quantitySold > 0;
  });
  const lowestPrice = availableTiers.length ? Math.min(...availableTiers.map((t) => Number(t.price))) : null;

  return (
    <Link to={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <div className="mb-2.5 h-20 rounded-lg bg-accent-light" />
        <div className="text-sm font-bold">{event.title}</div>
        <div className="my-1 text-xs text-muted">{date} · {event.venue}</div>
        {lowestPrice !== null ? (
          <div className="font-bold text-accent">From Rs. {lowestPrice}</div>
        ) : null}
      </Card>
    </Link>
  );
}
