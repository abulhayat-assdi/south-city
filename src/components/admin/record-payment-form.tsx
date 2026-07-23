'use client';

import { useActionState, useState } from 'react';
import { recordPayment, type PaymentActionState } from '@/server/actions/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export interface InstallmentOption {
  id: string;
  label: string; // "কিস্তি ৩ · বাকি ৳…"
}

export function RecordPaymentForm({
  saleId,
  installments,
}: {
  saleId: string;
  installments: InstallmentOption[];
}) {
  const [state, formAction, pending] = useActionState<PaymentActionState, FormData>(recordPayment, {});
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div>
        {state.ok && (
          <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            ✔ পেমেন্ট রেকর্ড হয়েছে — রশিদ {state.receiptNo}।
          </p>
        )}
        <Button onClick={() => setOpen(true)}>পেমেন্ট রেকর্ড করুন</Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-line bg-bg-soft/50 p-4">
      <input type="hidden" name="saleId" value={saleId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">অঙ্ক ৳ *</Label>
          <Input id="amount" name="amount" inputMode="numeric" placeholder="50000" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="paymentDate">তারিখ *</Label>
          <Input id="paymentDate" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="method">মাধ্যম *</Label>
          <Select id="method" name="method" defaultValue="CASH">
            <option value="CASH">নগদ (Cash)</option>
            <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার</option>
            <option value="CHEQUE">চেক</option>
            <option value="BKASH">বিকাশ</option>
            <option value="NAGAD">নগদ (Nagad)</option>
            <option value="OTHER">অন্যান্য</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="installmentId">কিস্তি (ঐচ্ছিক)</Label>
          <Select id="installmentId" name="installmentId" defaultValue="">
            <option value="">সাধারণ (অটো-বরাদ্দ)</option>
            {installments.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="referenceNo">রেফারেন্স নং</Label>
          <Input id="referenceNo" name="referenceNo" placeholder="চেক/ট্রানজেকশন আইডি" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">নোট</Label>
          <Input id="note" name="note" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        সাধারণ পেমেন্ট পুরোনো বকেয়া কিস্তিতে আগে বরাদ্দ হবে; অতিরিক্ত অ্যাডভান্স হিসেবে পরের কিস্তিতে যাবে।
      </p>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? 'রেকর্ড হচ্ছে…' : 'নিশ্চিত করুন'}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>বন্ধ করুন</Button>
      </div>
    </form>
  );
}
