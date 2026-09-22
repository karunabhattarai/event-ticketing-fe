import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizerSidebar } from '../../components/OrganizerSidebar';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { listMyEvents, createEvent, updateEvent } from '../../api/events';
import { createTier } from '../../api/tiers';
import { useOrganizerMutationError } from '../../lib/useMutationError';

// datetime-local inputs use "YYYY-MM-DDTHH:mm" (no timezone/seconds) — this
// pair converts to/from the ISO strings the API sends and expects.
function toDatetimeLocalValue(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const queryClient = useQueryClient();
  const handleMutationError = useOrganizerMutationError();

  // Editing a draft event requires the organizer-scoped list (public GET /events/:id
  // only returns published events) — see this task's plan note.
  const { data: myEvents } = useQuery({ queryKey: ['my-events'], queryFn: listMyEvents, enabled: isEditing });
  const existingEvent = myEvents?.find((e) => e.id === id);

  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saved, setSaved] = useState(false);

  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [newTierQuantity, setNewTierQuantity] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setVenue(existingEvent.venue);
      setDescription(existingEvent.description);
      setStartsAt(toDatetimeLocalValue(existingEvent.startsAt));
      setStatus(existingEvent.status === 'published' ? 'published' : 'draft');
    }
  }, [existingEvent]);

  const saveMutation = useMutation({
    mutationFn: () => {
      // datetime-local has no timezone suffix — appending it makes new Date()
      // parse it in the browser's local zone rather than falling back to UTC.
      const startsAtIso = new Date(startsAt).toISOString();
      return isEditing
        ? updateEvent(id!, { title, venue, description, startsAt: startsAtIso, status })
        : createEvent({ title, venue, description, startsAt: startsAtIso });
    },
    onSuccess: () => {
      setSaved(true);
      setSaveError(null);
      // 'my-events' is read from the cache to populate this form and the
      // dashboard/orders pages — without invalidating, a save/publish looks
      // like it silently did nothing everywhere else in the app.
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: (error) => setSaveError(handleMutationError(error)),
  });

  const parsedTierPrice = Number(newTierPrice);
  const parsedTierQuantity = Number(newTierQuantity);
  const isTierFormValid =
    newTierName.trim().length > 0 &&
    Number.isFinite(parsedTierPrice) &&
    parsedTierPrice > 0 &&
    Number.isInteger(parsedTierQuantity) &&
    parsedTierQuantity > 0;

  const addTierMutation = useMutation({
    mutationFn: () => createTier(id!, { name: newTierName, price: parsedTierPrice, quantityTotal: parsedTierQuantity }),
    onSuccess: () => {
      setNewTierName('');
      setNewTierPrice('');
      setNewTierQuantity('');
      setTierError(null);
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
    onError: (error) => setTierError(handleMutationError(error)),
  });

  return (
    <div className="flex">
      <OrganizerSidebar active="events" />
      <div className="flex-1 p-5">
        <h1 className="mb-4 text-lg font-bold">{isEditing ? 'Edit event' : 'New event'}</h1>
        <Card className="mb-4">
          <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2.5" />
          <Input placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="mb-2.5" />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="mb-2.5" />
          <Input type="datetime-local" aria-label="Event date and time" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mb-3" />
          <div className="mb-3 flex gap-2">
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${status === 'draft' ? 'border-accent bg-accent-light text-accent' : 'border-border'}`}
              onClick={() => setStatus('draft')}
            >
              Draft
            </button>
            <button
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${status === 'published' ? 'border-accent bg-accent-light text-accent' : 'border-border'}`}
              onClick={() => setStatus('published')}
            >
              Published
            </button>
          </div>
          <p className="mb-3 text-xs text-muted">Publish when ready — draft events aren't visible on the listing page.</p>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !startsAt}>
            Save
          </Button>
          {saved ? <p className="mt-2 text-xs text-green-700">Saved</p> : null}
          {saveError ? <p className="mt-2 text-xs text-red-600">{saveError}</p> : null}
        </Card>

        {isEditing ? (
          <Card>
            <div className="mb-3 text-sm font-bold">Ticket tiers</div>
            {(existingEvent?.tiers ?? []).map((tier) => (
              <div key={tier.id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
                <span>{tier.name}</span>
                <span>Rs. {tier.price} · {tier.quantitySold} / {tier.quantityTotal}</span>
              </div>
            ))}
            <div className="mt-3 flex gap-2">
              <Input placeholder="Name" value={newTierName} onChange={(e) => setNewTierName(e.target.value)} />
              <Input placeholder="Price" value={newTierPrice} onChange={(e) => setNewTierPrice(e.target.value)} />
              <Input placeholder="Quantity" value={newTierQuantity} onChange={(e) => setNewTierQuantity(e.target.value)} />
              <Button variant="outline" onClick={() => addTierMutation.mutate()} disabled={addTierMutation.isPending || !isTierFormValid}>
                + Add
              </Button>
            </div>
            {tierError ? <p className="mt-2 text-xs text-red-600">{tierError}</p> : null}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
