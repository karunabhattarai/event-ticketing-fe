import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { Card } from '../../components/ui/card';
import { StatusPill } from '../../components/StatusPill';
import { listMyOrders } from '../../api/orders';
import { useBuyerMutationError } from '../../lib/useMutationError';

export function MyOrdersPage() {
  const handleError = useBuyerMutationError();
  const [loadError, setLoadError] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['my-orders'], queryFn: listMyOrders, retry: false });

  // 401 (session expired) sends back to login; any other error (500, network)
  // showed an infinite "Loading..." before — now it's a visible message instead.
  useEffect(() => {
    if (query.error) setLoadError(handleError(query.error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.error]);

  if (loadError) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">{loadError}</p>
      </div>
    );
  }

  if (!query.data) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Nav variant="public" />
      <div className="p-6">
        <h1 className="mb-4 text-lg font-bold">My orders</h1>
        {query.data.map((order) => (
          <Card key={order.id} className="mb-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold">Order #{order.id.slice(0, 8)}</span>
            <StatusPill status={order.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}
