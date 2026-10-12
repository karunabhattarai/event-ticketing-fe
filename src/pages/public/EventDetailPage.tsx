import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { TierPicker } from '../../components/TierPicker';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getEvent } from '../../api/events';
import { useCart } from '../../context/CartContext';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCart } = useCart();
  const [selections, setSelections] = useState<Record<string, number>>({});

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
    retry: false,
  });

  if (isError) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">
          We couldn't find this event — it may have been removed or cancelled.
        </p>
      </div>
    );
  }

  if (isLoading || !event) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">Loading...</p>
      </div>
    );
  }

  const hasSelection = Object.values(selections).some((q) => q > 0);
  const hasPassed = new Date(event.startsAt) < new Date();
  const tiers = event.tiers ?? [];
  const now = new Date();
  const isUnavailable = (t: (typeof tiers)[number]) =>
    (t.salesStartAt && new Date(t.salesStartAt) > now) ||
    (t.salesEndAt && new Date(t.salesEndAt) < now) ||
    t.quantityTotal - t.quantitySold <= 0;
  const allUnavailable = tiers.length > 0 && tiers.every(isUnavailable);

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
            tiers={tiers}
            selections={selections}
            onChange={(tierId, quantity) => setSelections((s) => ({ ...s, [tierId]: quantity }))}
          />
          {hasPassed ? (
            <p className="mt-3 text-xs text-muted">This event has already taken place.</p>
          ) : allUnavailable ? (
            <p className="mt-3 text-xs text-muted">No tickets are currently available for this event.</p>
          ) : null}
          <Button
            className="mt-4 w-full"
            disabled={hasPassed || allUnavailable || !hasSelection}
            onClick={() => {
              setCart({ eventId: event.id, selections });
              navigate('/checkout');
            }}
          >
            Get tickets
          </Button>
        </Card>
      </div>
    </div>
  );
}
