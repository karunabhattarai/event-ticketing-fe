import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { Card } from '../../components/ui/card';
import { StatusPill } from '../../components/StatusPill';
import { getOrderStatus } from '../../api/orders';

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const { data: order, isError } = useQuery({
    queryKey: ['order-status', orderId, token],
    queryFn: () => getOrderStatus(orderId!, token),
    enabled: !!orderId && !!token,
    retry: false,
  });

  if (!token) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">
          This link is missing its access token — use the link from your confirmation email.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">
          We couldn't find this order — check the link from your confirmation email.
        </p>
      </div>
    );
  }

  if (!order) {
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
        <Card className="mx-auto max-w-md">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="text-sm font-bold">Order #{order.id.slice(0, 8)}</div>
            <StatusPill status={order.status} />
          </div>
          {order.status === 'failed' ? (
            <Link to="/" className="mt-2 inline-block text-sm font-semibold text-accent">Try again</Link>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
