import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { TierPicker } from '../../components/TierPicker';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getEvent } from '../../api/events';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selections, setSelections] = useState<Record<string, number>>({});

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  });

  if (isLoading || !event) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">Loading...</p>
      </div>
    );
  }

  const hasSelection = Object.values(selections).some((q) => q > 0);

  return (
    <div>
      <Nav variant="public" />
      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-4 h-40 rounded-xl bg-accent-light" />
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="my-1.5 text-xs text-muted">
            {new Date(event.startsAt).toLocaleString()} · {event.venue}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-zinc-700">{event.description}</p>
        </div>
        <Card>
          <div className="mb-3 text-sm font-bold">Choose tickets</div>
          <TierPicker
            tiers={event.tiers ?? []}
            selections={selections}
            onChange={(tierId, quantity) => setSelections((s) => ({ ...s, [tierId]: quantity }))}
          />
          <Button
            className="mt-4 w-full"
            disabled={!hasSelection}
            onClick={() => navigate('/checkout', { state: { eventId: event.id, selections } })}
          >
            Get tickets
          </Button>
        </Card>
      </div>
    </div>
  );
}
