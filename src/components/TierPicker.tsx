import { Button } from './ui/button';
import type { TicketTier } from '../api/events';

type Props = {
  tiers: TicketTier[];
  selections: Record<string, number>;
  onChange: (tierId: string, quantity: number) => void;
};

export function TierPicker({ tiers, selections, onChange }: Props) {
  return (
    <div>
      {tiers.map((tier) => {
        const remaining = tier.quantityTotal - tier.quantitySold;
        const quantity = selections[tier.id] ?? 0;
        const now = new Date();
        const notYetOnSale = !!tier.salesStartAt && new Date(tier.salesStartAt) > now;
        const salesEnded = !!tier.salesEndAt && new Date(tier.salesEndAt) < now;
        const unavailable = notYetOnSale || salesEnded || remaining <= 0;

        let statusLabel = '';
        if (notYetOnSale) statusLabel = ' · Not yet on sale';
        else if (salesEnded) statusLabel = ' · Sales ended';
        else if (remaining <= 0) statusLabel = ' · Sold out';
        else if (remaining < 20) statusLabel = ` · ${remaining} left`;

        return (
          <div key={tier.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
            <div>
              <div className="text-sm font-semibold">{tier.name}</div>
              <div className="text-xs text-muted">
                Rs. {tier.price}
                {statusLabel}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" className="px-2.5 py-0.5" disabled={quantity <= 0} onClick={() => onChange(tier.id, quantity - 1)}>
                −
              </Button>
              <span>{quantity}</span>
              <Button variant="outline" className="px-2.5 py-0.5" disabled={unavailable || quantity >= remaining} onClick={() => onChange(tier.id, quantity + 1)}>
                +
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
