'use client';

import { useActionState } from 'react';
import { updateCompanyProfile, type ContentActionState } from '@/server/actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type CompanyValues = Record<string, string>;

export function CompanyForm({ initial }: { initial: CompanyValues }) {
  const [state, formAction, pending] = useActionState<ContentActionState, FormData>(updateCompanyProfile, {});
  const v = initial;

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <Section title="পরিচিতি">
        <F label="নাম — English"><Input name="nameEn" defaultValue={v.nameEn} /></F>
        <F label="নাম — বাংলা"><Input name="nameBn" defaultValue={v.nameBn} /></F>
        <F label="ট্যাগলাইন (প্রধান)"><Input name="taglinePrimary" defaultValue={v.taglinePrimary} /></F>
        <F label="ট্যাগলাইন (গৌণ)"><Input name="taglineSecondary" defaultValue={v.taglineSecondary} /></F>
        <F label="Logo URL"><Input name="logoUrl" defaultValue={v.logoUrl} /></F>
      </Section>

      <Section title="আমাদের সম্পর্কে">
        <F label="About — English" full><Textarea name="aboutEn" defaultValue={v.aboutEn} rows={4} /></F>
        <F label="আমাদের সম্পর্কে — বাংলা" full><Textarea name="aboutBn" defaultValue={v.aboutBn} rows={4} /></F>
        <F label="Vision — English" full><Textarea name="visionEn" defaultValue={v.visionEn} rows={2} /></F>
        <F label="ভিশন — বাংলা" full><Textarea name="visionBn" defaultValue={v.visionBn} rows={2} /></F>
        <F label="Mission — English" full><Textarea name="missionEn" defaultValue={v.missionEn} rows={2} /></F>
        <F label="মিশন — বাংলা" full><Textarea name="missionBn" defaultValue={v.missionBn} rows={2} /></F>
        <F label="Core values JSON — [{en,bn}]" full>
          <Textarea name="coreValues" defaultValue={v.coreValues} rows={3} className="font-mono text-xs" />
        </F>
      </Section>

      <Section title="যোগাযোগ ও সোশ্যাল">
        <F label="ফোন"><Input name="phone" defaultValue={v.phone} /></F>
        <F label="ইমেইল"><Input name="email" defaultValue={v.email} /></F>
        <F label="WhatsApp (8801…)"><Input name="whatsapp" defaultValue={v.whatsapp} /></F>
        <F label="ঠিকানা — English"><Input name="addressEn" defaultValue={v.addressEn} /></F>
        <F label="ঠিকানা — বাংলা"><Input name="addressBn" defaultValue={v.addressBn} /></F>
        <F label="Facebook"><Input name="facebook" defaultValue={v.facebook} /></F>
        <F label="YouTube"><Input name="youtube" defaultValue={v.youtube} /></F>
        <F label="LinkedIn"><Input name="linkedin" defaultValue={v.linkedin} /></F>
      </Section>

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">✔ সংরক্ষিত হয়েছে।</p>}

      <Button type="submit" disabled={pending}>{pending ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</Button>
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
  return <div className={`space-y-2 ${full ? 'sm:col-span-2' : ''}`}><Label>{label}</Label>{children}</div>;
}
