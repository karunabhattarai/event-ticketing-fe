import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import type { Event } from '../api/events';

export function EventCard({ event }: { event: Event }) {
  const date = new Date(event.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const lowestPrice = event.tiers?.length
    ? Math.min(...event.tiers.map((t) => Number(t.price)))
    : null;

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
