'use client';

import { useActionState } from 'react';
import { changePasswordAction, type ActionState } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">নতুন পাসওয়ার্ড / New password</Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন / Confirm</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'সংরক্ষণ হচ্ছে…' : 'পাসওয়ার্ড সংরক্ষণ করুন / Save'}
      </Button>
    </form>
  );
}
