'use client';

import { useState, useTransition } from 'react';
import { createLoginAccount, type CreateLoginResult } from '@/server/actions/customers';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export function CreateLoginButton({ customerId }: { customerId: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<CreateLoginResult | null>(null);

  function handle() {
    start(async () => setResult(await createLoginAccount(customerId)));
  }

  if (result?.tempPassword) {
    return (
      <div className="rounded-md border border-gold/40 bg-gold/10 p-3 text-sm">
        <p className="font-semibold text-navy">✔ লগইন অ্যাকাউন্ট তৈরি হয়েছে — এই তথ্য একবারই দেখানো হবে:</p>
        <div className="mt-2 space-y-1 font-mono text-ink">
          <div>ইমেইল/ID: <span className="select-all font-semibold">{result.loginEmail}</span></div>
          <div>পাসওয়ার্ড: <span className="select-all font-semibold">{result.tempPassword}</span></div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          কাস্টমারকে এই তথ্য দিন। প্রথম লগইনে তাকে পাসওয়ার্ড পরিবর্তন করতে হবে।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handle} disabled={pending} variant="outline" size="sm">
        <KeyRound className="size-4" /> {pending ? 'তৈরি হচ্ছে…' : 'লগইন অ্যাকাউন্ট তৈরি করুন'}
      </Button>
      {result?.error && <p className="text-sm text-red-700">{result.error}</p>}
    </div>
  );
}
