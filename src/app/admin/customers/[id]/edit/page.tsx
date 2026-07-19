import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { updateCustomer, type CustomerActionState } from '@/server/actions/customers';
import { PageHeader } from '@/components/admin/page-header';
import { CustomerForm } from '@/components/admin/customer-form';

export const metadata: Metadata = { title: 'কাস্টমার এডিট' };

function d(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : '';
}

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const c = await prisma.customer.findUnique({ where: { id } });
  if (!c) notFound();

  const action = updateCustomer.bind(null, id) as (p: CustomerActionState, f: FormData) => Promise<CustomerActionState>;

  return (
    <div>
      <PageHeader title={`কাস্টমার এডিট — ${c.fullNameEn}`} subtitle={c.customerCode} />
      <CustomerForm
        action={action}
        submitLabel="পরিবর্তন সংরক্ষণ করুন"
        initial={{
          fullNameEn: c.fullNameEn,
          fullNameBn: c.fullNameBn ?? '',
          fatherName: c.fatherName ?? '',
          motherName: c.motherName ?? '',
          spouseName: c.spouseName ?? '',
          nidNumber: c.nidNumber ?? '',
          dateOfBirth: d(c.dateOfBirth),
          occupation: c.occupation ?? '',
          nationality: c.nationality ?? 'Bangladeshi',
          phonePrimary: c.phonePrimary,
          phoneSecondary: c.phoneSecondary ?? '',
          email: c.email ?? '',
          presentAddress: c.presentAddress ?? '',
          permanentAddress: c.permanentAddress ?? '',
          nomineeName: c.nomineeName ?? '',
          nomineeRelation: c.nomineeRelation ?? '',
          nomineeNid: c.nomineeNid ?? '',
          nomineePhone: c.nomineePhone ?? '',
          nomineeAddress: c.nomineeAddress ?? '',
          notes: c.notes ?? '',
        }}
      />
    </div>
  );
}
