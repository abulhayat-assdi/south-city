'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { ProjectActionState } from '@/server/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface ProjectFormValues {
  slug?: string;
  nameEn?: string;
  nameBn?: string;
  status?: string;
  tagline?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  masterPlanUrl?: string;
  locationEn?: string;
  locationBn?: string;
  sizeText?: string;
  sectorsText?: string;
  plotSizesText?: string;
  roadWidthText?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  mapEmbedUrl?: string;
  brochureUrl?: string;
  amenities?: string;
  landmarks?: string;
  distances?: string;
  boundaries?: string;
  plotTypes?: string;
  trustItems?: string;
  sortOrder?: string;
  isPublished?: boolean;
}

export function ProjectForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
  initial?: ProjectFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ProjectActionState, FormData>(action, {});
  const v = initial ?? {};

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <Section title="মূল তথ্য (Basics)">
        <F label="Slug * (যেমন south-city)"><Input name="slug" defaultValue={v.slug} required placeholder="north-city" /></F>
        <F label="স্ট্যাটাস (internal)">
          <Select name="status" defaultValue={v.status ?? 'ONGOING'}>
            <option value="UPCOMING">আসন্ন (Upcoming)</option>
            <option value="ONGOING">চলমান (Ongoing)</option>
            <option value="COMPLETED">সম্পন্ন (Completed)</option>
          </Select>
        </F>
        <F label="নাম — English *"><Input name="nameEn" defaultValue={v.nameEn} required /></F>
        <F label="নাম — বাংলা"><Input name="nameBn" defaultValue={v.nameBn} /></F>
        <F label="ট্যাগলাইন" full><Input name="tagline" defaultValue={v.tagline} /></F>
        <F label="লোকেশন — English"><Input name="locationEn" defaultValue={v.locationEn} /></F>
        <F label="লোকেশন — বাংলা"><Input name="locationBn" defaultValue={v.locationBn} /></F>
      </Section>

      <Section title="সংক্ষিপ্ত তথ্য (At a glance)">
        <F label="আয়তন (Size)"><Input name="sizeText" defaultValue={v.sizeText} placeholder="~500 Bigha" /></F>
        <F label="সেক্টর"><Input name="sectorsText" defaultValue={v.sectorsText} placeholder="4 (A–D)" /></F>
        <F label="প্লট সাইজ"><Input name="plotSizesText" defaultValue={v.plotSizesText} placeholder="3, 5 & 10 Katha" /></F>
        <F label="রাস্তা"><Input name="roadWidthText" defaultValue={v.roadWidthText} placeholder="25/40/60 ft" /></F>
      </Section>

      <Section title="মিডিয়া (Media & links)">
        <F label="Logo URL"><Input name="logoUrl" defaultValue={v.logoUrl} placeholder="/brand/sd-logo.svg" /></F>
        <F label="Hero image URL"><Input name="heroImageUrl" defaultValue={v.heroImageUrl} placeholder="/projects/…/hero.webp" /></F>
        <F label="Master plan image URL"><Input name="masterPlanUrl" defaultValue={v.masterPlanUrl} /></F>
        <F label="Brochure PDF URL"><Input name="brochureUrl" defaultValue={v.brochureUrl} /></F>
        <F label="Google Map embed URL" full><Input name="mapEmbedUrl" defaultValue={v.mapEmbedUrl} /></F>
      </Section>

      <Section title="বিবরণ (Description)">
        <F label="Description — English" full><Textarea name="descriptionEn" defaultValue={v.descriptionEn} rows={4} /></F>
        <F label="বিবরণ — বাংলা" full><Textarea name="descriptionBn" defaultValue={v.descriptionBn} rows={4} /></F>
      </Section>

      <Section title="স্ট্রাকচার্ড কনটেন্ট — JSON (Advanced)">
        <p className="sm:col-span-2 -mt-1 text-xs text-muted-foreground">
          এগুলো প্রজেক্ট পেজের সেকশন তৈরি করে। South City-র শেপ দেখতে seed.ts দেখুন। খালি রাখলে সেকশন দেখাবে না।
        </p>
        <F label="Amenities JSON" full><Textarea name="amenities" defaultValue={v.amenities} rows={3} className="font-mono text-xs" /></F>
        <F label="Trust items JSON" full><Textarea name="trustItems" defaultValue={v.trustItems} rows={3} className="font-mono text-xs" /></F>
        <F label="Plot types JSON" full><Textarea name="plotTypes" defaultValue={v.plotTypes} rows={3} className="font-mono text-xs" /></F>
        <F label="Landmarks JSON" full><Textarea name="landmarks" defaultValue={v.landmarks} rows={3} className="font-mono text-xs" /></F>
        <F label="Distances JSON" full><Textarea name="distances" defaultValue={v.distances} rows={3} className="font-mono text-xs" /></F>
        <F label="Boundaries JSON" full><Textarea name="boundaries" defaultValue={v.boundaries} rows={3} className="font-mono text-xs" /></F>
      </Section>

      <Section title="প্রকাশনা (Publish)">
        <F label="Sort order"><Input name="sortOrder" type="number" min={0} defaultValue={v.sortOrder ?? '0'} /></F>
        <div className="flex items-center gap-2 pt-7">
          <input id="isPublished" name="isPublished" type="checkbox" defaultChecked={v.isPublished ?? true} className="size-4" />
          <Label htmlFor="isPublished">পাবলিক সাইটে প্রকাশ করুন</Label>
        </div>
      </Section>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'সংরক্ষণ হচ্ছে…' : submitLabel}</Button>
        <Button asChild variant="outline" type="button"><Link href="/admin/projects">বাতিল</Link></Button>
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
