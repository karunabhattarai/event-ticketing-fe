import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Nav } from '../../components/Nav';
import { generateDynamicQr, pollDynamicQrStatus } from '../../api/payment';

export function DynamicQrPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const generateMutation = useMutation({ mutationFn: () => generateDynamicQr(orderId!, token) });

  useEffect(() => {
    generateMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  const statusQuery = useQuery({
    queryKey: ['dynamic-qr-status', orderId],
    queryFn: () => pollDynamicQrStatus(orderId!, token),
    enabled: generateMutation.isSuccess,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 3000 : false),
  });

  useEffect(() => {
    if (statusQuery.data?.status === 'paid') {
      navigate(`/order/${orderId}/confirmation`, { state: { accessToken: token } });
    }
  }, [statusQuery.data?.status, orderId, navigate, token]);

  if (statusQuery.data?.status === 'failed') {
    return (
      <div>
        <Nav variant="public" />
        <div className="p-6 text-center">
          <p className="mb-3 text-sm font-semibold">Payment failed</p>
          <a href="/" className="text-sm text-accent">Start over</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav variant="public" />
      <div className="flex flex-col items-center p-8 text-center">
        <p className="mb-1 text-base font-bold">Scan to pay</p>
        <p className="mb-4 text-xs text-muted">Open any banking app and scan</p>
        {generateMutation.data ? (
          <img
            src={generateMutation.data.qrImageDataUrl}
            alt="QR code to scan for payment"
            className="h-40 w-40 rounded-xl border border-border"
          />
        ) : (
          <div className="h-40 w-40 rounded-xl border border-border bg-gray-50" />
        )}
        <p className="mt-4 text-xs text-muted">Waiting for payment...</p>
      </div>
    </div>
  );
}
