'use client';

import { useState, useTransition } from 'react';
import { cancelSale } from '@/server/actions/sales';
import { Button } from '@/components/ui/button';

export function CancelSaleButton({ saleId }: { saleId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>বিক্রয় বাতিল</Button>;
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="বাতিলের কারণ"
        className="h-9 w-40 rounded border border-line px-2 text-sm"
      />
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await cancelSale(saleId, reason);
            if (res.error) setError(res.error);
            else setOpen(false);
          })
        }
      >
        নিশ্চিত করুন
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>ফিরে যান</Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
