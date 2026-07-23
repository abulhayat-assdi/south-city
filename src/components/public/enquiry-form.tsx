'use client';

import { useActionState } from 'react';
import { submitEnquiry, type EnquiryState } from '@/server/actions/enquiry';
import { type Lang } from '@/lib/public-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

export function EnquiryForm({ lang, projectSlug }: { lang: Lang; projectSlug?: string }) {
  const [state, formAction, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, {});
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-semibold text-green-800">{t('Thank you! We will contact you soon.', 'ধন্যবাদ! আমরা শীঘ্রই যোগাযোগ করব।')}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {projectSlug && <input type="hidden" name="projectSlug" value={projectSlug} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="name" placeholder={t('Your name', 'আপনার নাম')} required />
        <Input name="phone" placeholder={t('Mobile 01XXXXXXXXX', 'মোবাইল 01XXXXXXXXX')} inputMode="numeric" required />
        <Input name="email" type="email" placeholder={t('Email (optional)', 'ইমেইল (ঐচ্ছিক)')} />
        <Select name="preferredSize" defaultValue="">
          <option value="">{t('Preferred plot size', 'পছন্দের প্লট সাইজ')}</option>
          <option value="3">{t('3 Katha', '৩ কাঠা')}</option>
          <option value="5">{t('5 Katha', '৫ কাঠা')}</option>
          <option value="10">{t('10 Katha', '১০ কাঠা')}</option>
        </Select>
      </div>
      <Textarea name="message" placeholder={t('Your message (optional)', 'আপনার বার্তা (ঐচ্ছিক)')} rows={3} />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? t('Sending…', 'পাঠানো হচ্ছে…') : t('Send enquiry', 'অনুসন্ধান পাঠান')}
      </Button>
    </form>
  );
}
