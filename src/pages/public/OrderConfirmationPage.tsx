import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { Button } from '../../components/ui/button';
import { getOrderStatus, resendOrderConfirmationEmail } from '../../api/orders';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const accessToken = (location.state as { accessToken?: string } | null)?.accessToken;
  const [resendSent, setResendSent] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['order-status', orderId, accessToken],
    queryFn: () => getOrderStatus(orderId!, accessToken!),
    enabled: !!orderId && !!accessToken,
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOrderConfirmationEmail(orderId!, accessToken!),
    onSuccess: () => setResendSent(true),
  });

  if (!accessToken) {
    return (
      <div>
        <Nav variant="public" />
        <div className="p-6 text-center text-sm">
          <p className="mb-2 text-muted">Check your email for your ticket confirmation.</p>
          <Link to={`/order/${orderId}/status`} className="text-accent">View your order</Link>
        </div>
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
      <div className="mx-auto max-w-md p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <span className="text-xl font-bold text-green-600">✓</span>
        </div>
        <p className="text-lg font-bold">You're going!</p>
        <p className="mt-1 mb-5 text-xs text-muted">Your tickets have been sent to your email</p>
        {order.items.map((item) => (
          <div key={item.id} className="mb-2 rounded-lg border border-dashed border-border p-3 text-left text-sm">
            {item.ticketTier.name} × {item.quantity}
          </div>
        ))}
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending || resendSent}
        >
          {resendSent ? 'Email sent' : 'Resend email'}
        </Button>
      </div>
    </div>
  );
}
