import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { checkinTicket } from '../../api/checkin';
import { ApiError } from '../../lib/apiClient';

export function CheckinPage() {
  const [code, setCode] = useState('');

  const mutation = useMutation({ mutationFn: () => checkinTicket(code) });

  let resultBanner: { text: string; tone: 'green' | 'red' } | null = null;
  if (mutation.isSuccess) {
    resultBanner = { text: `✓ Valid ticket — ${mutation.data.tierName} · ${mutation.data.holderName}`, tone: 'green' };
  } else if (mutation.isError && mutation.error instanceof ApiError) {
    resultBanner = mutation.error.status === 409
      ? { text: 'Already checked in', tone: 'red' }
      : { text: 'Invalid ticket', tone: 'red' };
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="border-b border-border bg-white p-3.5">
        <span className="text-base font-bold text-accent">tixly</span>
      </div>
      <div className="p-5">
        <Input
          placeholder="Ticket code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-2.5"
        />
        <Button className="w-full" onClick={() => mutation.mutate()} disabled={!code || mutation.isPending}>
          Check in
        </Button>
        {resultBanner ? (
          <div className={`mt-4 rounded-lg p-3 text-center text-sm font-semibold ${resultBanner.tone === 'green' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {resultBanner.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}
