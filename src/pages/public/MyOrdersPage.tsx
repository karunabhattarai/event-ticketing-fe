import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { Card } from '../../components/ui/card';
import { StatusPill } from '../../components/StatusPill';
import { listMyOrders } from '../../api/orders';
import { ApiError } from '../../lib/apiClient';

export function MyOrdersPage() {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['my-orders'], queryFn: listMyOrders, retry: false });

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      navigate('/login');
    }
  }, [query.error, navigate]);

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
