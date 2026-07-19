'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { CustomerActionState } from '@/server/actions/customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type CustomerFormValues = Partial<Record<
  | 'fullNameEn' | 'fullNameBn' | 'fatherName' | 'motherName' | 'spouseName'
  | 'nidNumber' | 'dateOfBirth' | 'occupation' | 'nationality'
  | 'phonePrimary' | 'phoneSecondary' | 'email'
  | 'presentAddress' | 'permanentAddress'
  | 'nomineeName' | 'nomineeRelation' | 'nomineeNid' | 'nomineePhone' | 'nomineeAddress'
  | 'notes',
  string
>>;

export function CustomerForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: CustomerActionState, formData: FormData) => Promise<CustomerActionState>;
  initial?: CustomerFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<CustomerActionState, FormData>(action, {});
  const v = initial ?? {};

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <Section title="ক্রেতার তথ্য (Buyer)">
        <F label="পূর্ণ নাম — English *"><Input name="fullNameEn" defaultValue={v.fullNameEn} required /></F>
        <F label="পূর্ণ নাম — বাংলা"><Input name="fullNameBn" defaultValue={v.fullNameBn} /></F>
        <F label="পিতার নাম"><Input name="fatherName" defaultValue={v.fatherName} /></F>
        <F label="মাতার নাম"><Input name="motherName" defaultValue={v.motherName} /></F>
        <F label="স্বামী/স্ত্রীর নাম"><Input name="spouseName" defaultValue={v.spouseName} /></F>
        <F label="NID নম্বর"><Input name="nidNumber" defaultValue={v.nidNumber} inputMode="numeric" /></F>
        <F label="জন্মতারিখ"><Input name="dateOfBirth" type="date" defaultValue={v.dateOfBirth} /></F>
        <F label="পেশা"><Input name="occupation" defaultValue={v.occupation} /></F>
        <F label="জাতীয়তা"><Input name="nationality" defaultValue={v.nationality ?? 'Bangladeshi'} /></F>
        <F label="মোবাইল (প্রধান) *"><Input name="phonePrimary" defaultValue={v.phonePrimary} placeholder="01XXXXXXXXX" inputMode="numeric" required /></F>
        <F label="মোবাইল (বিকল্প)"><Input name="phoneSecondary" defaultValue={v.phoneSecondary} placeholder="01XXXXXXXXX" inputMode="numeric" /></F>
        <F label="ইমেইল"><Input name="email" type="email" defaultValue={v.email} /></F>
      </Section>

      <Section title="ঠিকানা (Address)">
        <F label="বর্তমান ঠিকানা" full><Textarea name="presentAddress" defaultValue={v.presentAddress} /></F>
        <F label="স্থায়ী ঠিকানা" full><Textarea name="permanentAddress" defaultValue={v.permanentAddress} /></F>
      </Section>

      <Section title="নমিনি (Nominee)">
        <F label="নমিনির নাম"><Input name="nomineeName" defaultValue={v.nomineeName} /></F>
        <F label="সম্পর্ক"><Input name="nomineeRelation" defaultValue={v.nomineeRelation} /></F>
        <F label="নমিনির NID"><Input name="nomineeNid" defaultValue={v.nomineeNid} inputMode="numeric" /></F>
        <F label="নমিনির মোবাইল"><Input name="nomineePhone" defaultValue={v.nomineePhone} placeholder="01XXXXXXXXX" inputMode="numeric" /></F>
        <F label="নমিনির ঠিকানা" full><Textarea name="nomineeAddress" defaultValue={v.nomineeAddress} /></F>
      </Section>

      <Section title="অন্যান্য">
        <F label="নোট" full><Textarea name="notes" defaultValue={v.notes} /></F>
      </Section>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'সংরক্ষণ হচ্ছে…' : submitLabel}</Button>
        <Button asChild variant="outline" type="button"><Link href="/admin/customers">বাতিল</Link></Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 border-b border-line pb-2 font-display text-base font-semibold text-navy">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-2 ${full ? 'sm:col-span-2' : ''}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
