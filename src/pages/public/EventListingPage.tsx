import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { EventCard } from '../../components/EventCard';
import { Button } from '../../components/ui/button';
import { listPublishedEvents, EVENTS_PAGE_SIZE } from '../../api/events';

export function EventListingPage() {
  const [when, setWhen] = useState<'upcoming' | 'past'>('upcoming');
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['events', when],
    queryFn: ({ pageParam }) => listPublishedEvents(when, pageParam),
    initialPageParam: 1,
    // A full page means there may be more; a short page is the last one.
    getNextPageParam: (lastPage, allPages) => (lastPage.length === EVENTS_PAGE_SIZE ? allPages.length + 1 : undefined),
  });
  const events = data?.pages.flat();

  return (
    <div>
      <Nav variant="public" />
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Find your next night out</h1>
        <p className="mb-5 text-sm text-muted">Live music, comedy, festivals near you</p>

        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setWhen('upcoming')}
            className={when === 'upcoming' ? 'font-semibold text-accent' : 'text-muted'}
          >
            Upcoming
          </button>
          <span className="text-muted">·</span>
          <button
            type="button"
            onClick={() => setWhen('past')}
            className={when === 'past' ? 'font-semibold text-accent' : 'text-muted'}
          >
            Past
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : events && events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            {hasNextPage ? (
              <div className="mt-5 text-center">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">No events found. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
