'use client';

import { useState, useTransition } from 'react';
import { voidPayment } from '@/server/actions/payments';
import { Ban } from 'lucide-react';

/** ADMIN-only void control. Rendered only when the viewer is ADMIN. */
export function VoidPaymentButton({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        <Ban className="size-3.5" /> ভয়েড
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="কারণ"
        className="h-7 w-28 rounded border border-line px-2 text-xs"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await voidPayment(paymentId, reason);
            if (res.error) setError(res.error);
            else setOpen(false);
          })
        }
        className="rounded bg-red-600 px-2 py-1 text-xs text-white disabled:opacity-50"
      >
        নিশ্চিত
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground">বাতিল</button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
