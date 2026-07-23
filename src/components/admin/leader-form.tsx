'use client';

import { useActionState } from 'react';
import { updateLeaderMessage, type ContentActionState } from '@/server/actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface LeaderValues {
  id: string;
  role: string;
  personName: string;
  titleEn: string;
  titleBn: string;
  photoUrl: string;
  messageEn: string;
  messageBn: string;
}

export function LeaderForm({ initial }: { initial: LeaderValues }) {
  const action = updateLeaderMessage.bind(null, initial.id);
  const [state, formAction, pending] = useActionState<ContentActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-line bg-white p-5">
      <h2 className="font-display text-lg font-semibold text-navy">{initial.role === 'CHAIRMAN' ? 'চেয়ারম্যান' : 'ব্যবস্থাপনা পরিচালক (MD)'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>নাম</Label><Input name="personName" defaultValue={initial.personName} /></div>
        <div className="space-y-2"><Label>Photo URL</Label><Input name="photoUrl" defaultValue={initial.photoUrl} /></div>
        <div className="space-y-2"><Label>পদবি — English</Label><Input name="titleEn" defaultValue={initial.titleEn} /></div>
        <div className="space-y-2"><Label>পদবি — বাংলা</Label><Input name="titleBn" defaultValue={initial.titleBn} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>বার্তা — English</Label><Textarea name="messageEn" defaultValue={initial.messageEn} rows={4} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>বার্তা — বাংলা</Label><Textarea name="messageBn" defaultValue={initial.messageBn} rows={4} /></div>
      </div>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">✔ সংরক্ষিত।</p>}
      <Button type="submit" disabled={pending}>{pending ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</Button>
    </form>
  );
}
