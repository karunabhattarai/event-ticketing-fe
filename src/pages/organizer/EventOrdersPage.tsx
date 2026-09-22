import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizerSidebar } from '../../components/OrganizerSidebar';
import { StatusPill } from '../../components/StatusPill';
import { Button } from '../../components/ui/button';
import { listEventOrders, resendOrderEmail, refundOrder } from '../../api/orders';
import { useOrganizerMutationError } from '../../lib/useMutationError';

export function EventOrdersPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const handleMutationError = useOrganizerMutationError();
  const [actionError, setActionError] = useState<string | null>(null);
  // Which order's resend/refund is in flight — scopes the disabled state to the row
  // being acted on, instead of disabling every row's buttons while any one request
  // is pending.
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const { data } = useQuery({ queryKey: ['event-orders', id], queryFn: () => listEventOrders(id!) });

  const resendMutation = useMutation({
    mutationFn: (orderId: string) => resendOrderEmail(id!, orderId),
    onMutate: (orderId) => setPendingOrderId(orderId),
    onSuccess: () => setActionError(null),
    onError: (error) => setActionError(handleMutationError(error)),
    onSettled: () => setPendingOrderId(null),
  });

  const refundMutation = useMutation({
    mutationFn: (orderId: string) => refundOrder(id!, orderId),
    onMutate: (orderId) => setPendingOrderId(orderId),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['event-orders', id] });
    },
    onError: (error) => setActionError(handleMutationError(error)),
    onSettled: () => setPendingOrderId(null),
  });

  return (
    <div className="flex">
      <OrganizerSidebar active="events" />
      <div className="flex-1 p-5">
        <h1 className="mb-1 text-lg font-bold">Orders</h1>
        {data ? (
          <p className="mb-4 text-xs text-muted">
            {data.stats.fulfilled} fulfilled · {data.stats.pending} pending · {data.stats.failed} failed
          </p>
        ) : null}
        {actionError ? <p className="mb-3 text-xs text-red-600">{actionError}</p> : null}
        <div className="rounded-xl border border-border bg-white">
          {(data?.orders ?? []).map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b border-border px-3.5 py-3 text-sm last:border-0">
              <span>{order.guestEmail ?? order.guestName ?? order.buyerId ?? ''}</span>
              <StatusPill status={order.status} />
              <div className="flex gap-2">
                {order.status === 'paid' || order.status === 'fulfilled' ? (
                  <Button variant="outline" onClick={() => resendMutation.mutate(order.id)} disabled={pendingOrderId === order.id}>
                    Resend
                  </Button>
                ) : null}
                {order.status === 'paid' || order.status === 'fulfilled' ? (
                  <Button variant="outline" onClick={() => refundMutation.mutate(order.id)} disabled={pendingOrderId === order.id}>
                    Refund
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
