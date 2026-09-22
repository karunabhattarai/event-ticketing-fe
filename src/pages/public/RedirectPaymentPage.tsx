import { useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { initiateRedirectPayment } from '../../api/payment';
import { ApiError } from '../../lib/apiClient';

export function RedirectPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const mutation = useMutation({
    mutationFn: () => initiateRedirectPayment(orderId!, token),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  // initiatePayment is not idempotent (a second call opens a second Fonepay
  // session) — guard against the effect firing twice, e.g. under React
  // StrictMode's double-invoke or an unrelated re-render.
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  if (mutation.isError) {
    return (
      <div>
        <Nav variant="public" />
        <div className="p-6 text-center text-sm">
          <p className="mb-2 font-semibold">
            {mutation.error instanceof ApiError ? mutation.error.message : "Couldn't start payment"}
          </p>
          <Link to="/" className="text-accent">Try again</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav variant="public" />
      <p className="p-6 text-sm text-muted">Redirecting to Fonepay...</p>
    </div>
  );
}
