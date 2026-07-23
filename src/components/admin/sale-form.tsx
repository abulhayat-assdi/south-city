'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import type { SaleActionState } from '@/server/actions/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface PlotChoice {
  id: string;
  projectId: string;
  label: string; // "A-01 · 5 Katha"
  basePrice: string | null;
}
export interface CustomerChoice {
  id: string;
  label: string; // "SDC-0001 · Name · 01…"
}
export interface ProjectChoice {
  id: string;
  name: string;
}

const bdt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n);

export function SaleForm({
  action,
  projects,
  plots,
  customers,
  defaultProjectId,
  defaultCustomerId,
}: {
  action: (prev: SaleActionState, fd: FormData) => Promise<SaleActionState>;
  projects: ProjectChoice[];
  plots: PlotChoice[];
  customers: CustomerChoice[];
  defaultProjectId?: string;
  defaultCustomerId?: string;
}) {
  const [state, formAction, pending] = useActionState<SaleActionState, FormData>(action, {});
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? '');
  const [plotId, setPlotId] = useState('');
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('INSTALLMENT');
  const [salePrice, setSalePrice] = useState('');
  const [downPayment, setDownPayment] = useState('0');
  const [count, setCount] = useState('12');

  const projectPlots = useMemo(() => plots.filter((p) => p.projectId === projectId), [plots, projectId]);

  // Live preview only — the server recomputes exactly (poisha) on submit.
  const preview = useMemo(() => {
    const price = Number(salePrice) || 0;
    const down = Number(downPayment) || 0;
    const n = Number(count) || 0;
    if (paymentType !== 'INSTALLMENT' || price <= 0 || n <= 0 || down > price) return null;
    const financed = price - down;
    const per = Math.round((financed / n) * 100) / 100;
    const last = Math.round((financed - per * (n - 1)) * 100) / 100;
    return { financed, per, last, n };
  }, [salePrice, downPayment, count, paymentType]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>প্রজেক্ট *</Label>
          <Select value={projectId} onChange={(e) => { setProjectId(e.target.value); setPlotId(''); }} required>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>প্লট (খালি) *</Label>
          <Select name="plotId" value={plotId} onChange={(e) => {
            setPlotId(e.target.value);
            const chosen = projectPlots.find((p) => p.id === e.target.value);
            if (chosen?.basePrice && !salePrice) setSalePrice(chosen.basePrice);
          }} required>
            <option value="">— নির্বাচন করুন —</option>
            {projectPlots.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
          {projectPlots.length === 0 && <p className="text-xs text-red-600">এই প্রজেক্টে খালি প্লট নেই।</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>কাস্টমার *</Label>
        <Select name="customerId" defaultValue={defaultCustomerId ?? ''} required>
          <option value="">— নির্বাচন করুন —</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
        <p className="text-xs text-muted-foreground">নতুন কাস্টমার? আগে <Link href="/admin/customers/new" className="text-navy underline">কাস্টমার তৈরি করুন</Link>।</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>বিক্রয়মূল্য ৳ * (আলোচিত)</Label>
          <Input name="salePrice" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} inputMode="numeric" placeholder="6000000" required />
        </div>
        <div className="space-y-2">
          <Label>ডাউন পেমেন্ট ৳</Label>
          <Input name="downPayment" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label>পেমেন্ট ধরন *</Label>
          <Select name="paymentType" value={paymentType} onChange={(e) => setPaymentType(e.target.value as 'FULL' | 'INSTALLMENT')}>
            <option value="INSTALLMENT">কিস্তি (Installment)</option>
            <option value="FULL">সম্পূর্ণ (Full)</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>বুকিং তারিখ *</Label>
          <Input name="bookingDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </div>
        {paymentType === 'INSTALLMENT' && (
          <>
            <div className="space-y-2">
              <Label>কিস্তির সংখ্যা (মাস) *</Label>
              <Input name="installmentCount" value={count} onChange={(e) => setCount(e.target.value)} inputMode="numeric" placeholder="60" />
            </div>
            <div className="space-y-2">
              <Label>প্রথম কিস্তির তারিখ *</Label>
              <Input name="installmentStartDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label>নোট</Label>
        <Textarea name="notes" />
      </div>

      {preview && (
        <div className="rounded-md border border-line bg-bg-soft/60 p-4 text-sm">
          <div className="mb-2 font-semibold text-navy">কিস্তি প্রিভিউ (আনুমানিক)</div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">অর্থায়িত (financed)</span><span className="text-right font-medium">{bdt(preview.financed)}</span>
            <span className="text-muted-foreground">প্রতি কিস্তি × {preview.n - 1}</span><span className="text-right font-medium">{bdt(preview.per)}</span>
            <span className="text-muted-foreground">শেষ কিস্তি</span><span className="text-right font-medium">{bdt(preview.last)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">চূড়ান্ত হিসাব সার্ভারে নির্ভুলভাবে (পয়সা পর্যন্ত) তৈরি হবে।</p>
        </div>
      )}

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'তৈরি হচ্ছে…' : 'বিক্রয় নিশ্চিত করুন'}</Button>
        <Button asChild variant="outline" type="button"><Link href="/admin/sales">বাতিল</Link></Button>
      </div>
    </form>
  );
}
