import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { CompanyForm } from '@/components/admin/company-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'কনটেন্ট' };

export default async function ContentPage() {
  await requireAdmin();
  const c = await prisma.companyProfile.findUnique({ where: { id: 1 } });

  const initial: Record<string, string> = {
    nameEn: c?.nameEn ?? '', nameBn: c?.nameBn ?? '',
    taglinePrimary: c?.taglinePrimary ?? '', taglineSecondary: c?.taglineSecondary ?? '',
    aboutEn: c?.aboutEn ?? '', aboutBn: c?.aboutBn ?? '',
    visionEn: c?.visionEn ?? '', visionBn: c?.visionBn ?? '',
    missionEn: c?.missionEn ?? '', missionBn: c?.missionBn ?? '',
    coreValues: c?.coreValues ? JSON.stringify(c.coreValues, null, 2) : '',
    logoUrl: c?.logoUrl ?? '',
    phone: c?.phone ?? '', email: c?.email ?? '',
    addressEn: c?.addressEn ?? '', addressBn: c?.addressBn ?? '',
    whatsapp: c?.whatsapp ?? '', facebook: c?.facebook ?? '', youtube: c?.youtube ?? '', linkedin: c?.linkedin ?? '',
  };

  return (
    <div>
      <PageHeader
        title="সাইট কনটেন্ট"
        subtitle="কোম্পানি প্রোফাইল, চেয়ারম্যান/এমডি বার্তা ও নিউজ সম্পাদনা করুন।"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href="/admin/content/leaders">চেয়ারম্যান/এমডি</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/content/news">নিউজ</Link></Button>
          </div>
        }
      />
      <CompanyForm initial={initial} />
    </div>
  );
}
