type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'failed' | 'refunded';

const STYLES: Record<OrderStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Paid', classes: 'bg-green-50 text-green-700' },
  fulfilled: { label: 'Fulfilled', classes: 'bg-green-50 text-green-700' },
  failed: { label: 'Failed', classes: 'bg-red-50 text-red-700' },
  refunded: { label: 'Refunded', classes: 'bg-gray-100 text-gray-600' },
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const { label, classes } = STYLES[status];
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${classes}`}>{label}</span>;
}
