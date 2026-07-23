'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { PlotActionState } from '@/server/actions/plots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface PlotFormValues {
  projectId?: string;
  sector?: string;
  plotNumber?: string;
  sizeKatha?: string;
  category?: string;
  roadWidthFt?: string;
  dimensions?: string;
  faceDirection?: string;
  status?: string;
  basePrice?: string;
  remarks?: string;
}

export interface ProjectChoice {
  id: string;
  name: string;
}

export function PlotForm({
  action,
  initial,
  submitLabel,
  projects,
}: {
  action: (prev: PlotActionState, formData: FormData) => Promise<PlotActionState>;
  initial?: PlotFormValues;
  submitLabel: string;
  projects: ProjectChoice[];
}) {
  const [state, formAction, pending] = useActionState<PlotActionState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="প্রজেক্ট (Project)" name="projectId">
          <Select name="projectId" defaultValue={initial?.projectId ?? projects[0]?.id ?? ''} required>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="সেক্টর (Sector)" name="sector">
          <Select name="sector" defaultValue={initial?.sector ?? 'A'} required>
            {['A', 'B', 'C', 'D'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="প্লট নম্বর (Plot no.)" name="plotNumber">
          <Input name="plotNumber" defaultValue={initial?.plotNumber} required />
        </Field>
        <Field label="সাইজ — কাঠা (Size, Katha)" name="sizeKatha">
          <Input name="sizeKatha" defaultValue={initial?.sizeKatha} placeholder="5" required />
        </Field>
        <Field label="ক্যাটাগরি (Category)" name="category">
          <Select name="category" defaultValue={initial?.category ?? 'RESIDENTIAL'}>
            <option value="RESIDENTIAL">আবাসিক (Residential)</option>
            <option value="COMMERCIAL">বাণিজ্যিক (Commercial)</option>
          </Select>
        </Field>
        <Field label="রাস্তা (ft)" name="roadWidthFt">
          <Select name="roadWidthFt" defaultValue={initial?.roadWidthFt ?? ''}>
            <option value="">—</option>
            {[25, 40, 60].map((r) => (
              <option key={r} value={r}>{r} ft</option>
            ))}
          </Select>
        </Field>
        <Field label="মাপ (Dimensions)" name="dimensions">
          <Input name="dimensions" defaultValue={initial?.dimensions} placeholder="40ft x 90ft" />
        </Field>
        <Field label="ফেস (Facing)" name="faceDirection">
          <Input name="faceDirection" defaultValue={initial?.faceDirection} placeholder="South" />
        </Field>
        <Field label="স্ট্যাটাস (Status)" name="status">
          <Select name="status" defaultValue={initial?.status ?? 'AVAILABLE'}>
            <option value="AVAILABLE">খালি (Available)</option>
            <option value="RESERVED">সংরক্ষিত (Reserved)</option>
            <option value="BOOKED">বুকড (Booked)</option>
            <option value="SOLD">বিক্রীত (Sold)</option>
          </Select>
        </Field>
        <Field label="নির্দেশক মূল্য ৳ (Base price)" name="basePrice">
          <Input name="basePrice" defaultValue={initial?.basePrice} placeholder="6000000" />
        </Field>
      </div>
      <Field label="মন্তব্য (Remarks)" name="remarks">
        <Textarea name="remarks" defaultValue={initial?.remarks} />
      </Field>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'সংরক্ষণ হচ্ছে…' : submitLabel}</Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/plots">বাতিল</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
    </div>
  );
}
