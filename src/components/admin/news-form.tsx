'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertNews, type ContentActionState } from '@/server/actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface NewsValues {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  coverUrl?: string;
  isPublished?: boolean;
}

export function NewsForm({ initial }: { initial?: NewsValues }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ContentActionState, FormData>(async (prev, fd) => {
    const res = await upsertNews(prev, fd);
    if (res.ok) router.push('/admin/content/news');
    return res;
  }, {});
  const v = initial ?? {};

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Slug *</Label><Input name="slug" defaultValue={v.slug} required placeholder="eid-notice-2026" /></div>
        <div className="space-y-2"><Label>Cover image URL</Label><Input name="coverUrl" defaultValue={v.coverUrl} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>শিরোনাম — English *</Label><Input name="titleEn" defaultValue={v.titleEn} required /></div>
        <div className="space-y-2 sm:col-span-2"><Label>শিরোনাম — বাংলা</Label><Input name="titleBn" defaultValue={v.titleBn} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>বিবরণ — English</Label><Textarea name="bodyEn" defaultValue={v.bodyEn} rows={5} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>বিবরণ — বাংলা</Label><Textarea name="bodyBn" defaultValue={v.bodyBn} rows={5} /></div>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isPublished" defaultChecked={v.isPublished ?? false} className="size-4" />
        <span>পাবলিশ করুন</span>
      </label>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</Button>
    </form>
  );
}
