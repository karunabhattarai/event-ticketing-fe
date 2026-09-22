import { useQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { EventCard } from '../../components/EventCard';
import { listPublishedEvents } from '../../api/events';

export function EventListingPage() {
  const { data: events, isLoading } = useQuery({ queryKey: ['events'], queryFn: listPublishedEvents });

  return (
    <div>
      <Nav variant="public" />
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Find your next night out</h1>
        <p className="mb-5 text-sm text-muted">Live music, comedy, festivals near you</p>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No events found. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
