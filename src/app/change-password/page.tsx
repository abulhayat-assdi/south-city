import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from './change-password-form';

export const metadata: Metadata = { title: 'পাসওয়ার্ড পরিবর্তন / Change password' };

export default async function ChangePasswordPage() {
  const user = await currentUser();
  if (!user) redirect('/login');

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-deep px-4 py-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>নতুন পাসওয়ার্ড সেট করুন</CardTitle>
            <CardDescription>
              নিরাপত্তার জন্য প্রথমবার লগইনে আপনার পাসওয়ার্ড পরিবর্তন করা আবশ্যক।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
