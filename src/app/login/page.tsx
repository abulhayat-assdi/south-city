import Link from 'next/link';
import type { Metadata } from 'next';
import { currentUser } from '@/server/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'লগইন / Login' };

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect('/post-login');

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-deep px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display text-2xl font-bold text-white">
            South City
          </Link>
          <p className="mt-1 text-sm text-white/60">South Dhaka Properties &amp; Housing Ltd.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>লগইন / Sign in</CardTitle>
            <CardDescription>
              অ্যাকাউন্ট অ্যাডমিন কর্তৃক তৈরি হয়। প্রথমবার লগইনে পাসওয়ার্ড পরিবর্তন করতে হবে।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
