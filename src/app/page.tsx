import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Temporary public landing. The full bilingual marketing site is ported from the
// existing Astro build in step 11 (spec §11); this keeps "/" alive until then.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy-deep px-6 text-center text-white">
      <p className="mb-3 text-sm uppercase tracking-widest text-gold">South Dhaka Properties &amp; Housing Ltd.</p>
      <h1 className="font-display text-4xl font-bold text-white sm:text-6xl">South City</h1>
      <p className="mt-4 max-w-xl text-lg text-white/70">
        যেখানে আপনার স্বপ্ন খুঁজে পায় ঠিকানা — সায়েদপুর, দক্ষিণ কেরানীগঞ্জে পরিকল্পিত আবাসিক ও বাণিজ্যিক প্লট।
      </p>
      <p className="mt-2 max-w-xl text-sm text-white/50">
        Where Your Dream Finds Its Address · marketing site coming soon.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="gold" size="lg">
          <Link href="/login">লগইন / Login</Link>
        </Button>
      </div>
    </main>
  );
}
