import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { CartSummary } from '../../components/CartSummary';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { useCart } from '../../context/CartContext';
import { getEvent } from '../../api/events';
import { createOrder } from '../../api/checkout';
import type { PaymentMethod } from '../../api/checkout';
import { ApiError } from '../../lib/apiClient';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('redirect');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: event, isError } = useQuery({
    queryKey: ['event', cart?.eventId],
    queryFn: () => getEvent(cart!.eventId),
    enabled: !!cart?.eventId,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => navigate(`/checkout/${order.id}/pay?method=${order.paymentMethod}&token=${order.accessToken}`),
  });

  if (!cart) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">Your cart is empty. <a className="text-accent" href="/">Browse events</a>.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">Couldn't load this event — <a className="text-accent" href="/">browse events</a> and try again.</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (new Date(event.startsAt) < new Date()) {
    return (
      <div>
        <Nav variant="public" />
        <p className="p-6 text-sm text-muted">This event has already taken place. <a className="text-accent" href="/">Browse events</a>.</p>
      </div>
    );
  }

  function handleSubmit() {
    if (!guestName.trim()) {
      setValidationError('Name is required');
      return;
    }
    if (!guestEmail.trim()) {
      setValidationError('Email is required');
      return;
    }
    setValidationError(null);
    mutation.reset();

    mutation.mutate({
      items: Object.entries(cart!.selections)
        .filter(([, qty]) => qty > 0)
        .map(([tierId, quantity]) => ({ tierId, quantity })),
      guestEmail,
      guestName,
      paymentMethod,
    });
  }

  return (
    <div>
      <Nav variant="public" />
      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="mb-3 text-base font-bold">Your details</h2>
          <Card className="mb-3.5">
            <Input placeholder="Full name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="mb-2.5" />
            <Input placeholder="Email address" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            {validationError ? <p className="mt-2 text-xs text-red-600">{validationError}</p> : null}
            {mutation.isError ? (
              <p className="mt-2 text-xs text-red-600">
                {mutation.error instanceof ApiError ? mutation.error.message : "Couldn't start checkout — try again"}
              </p>
            ) : null}
          </Card>

          <h2 className="mb-3 text-base font-bold">Payment method</h2>
          <div className="flex gap-2.5">
            <button
              className={`flex-1 rounded-lg border p-3 text-left text-sm ${paymentMethod === 'redirect' ? 'border-accent bg-accent-light' : 'border-border'}`}
              onClick={() => setPaymentMethod('redirect')}
            >
              <div className="font-semibold">Fonepay redirect</div>
              <div className="text-xs text-muted">Pay on Fonepay's site</div>
            </button>
            <button
              className={`flex-1 rounded-lg border p-3 text-left text-sm ${paymentMethod === 'dynamic_qr' ? 'border-accent bg-accent-light' : 'border-border'}`}
              onClick={() => setPaymentMethod('dynamic_qr')}
            >
              <div className="font-semibold">Scan QR</div>
              <div className="text-xs text-muted">Pay with any banking app</div>
            </button>
          </div>
        </div>

        <div>
          <CartSummary event={event} selections={cart.selections} />
          <Button className="mt-3.5 w-full" onClick={handleSubmit} disabled={mutation.isPending}>
            Continue to pay
          </Button>
        </div>
      </div>
    </div>
  );
}
