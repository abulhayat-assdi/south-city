import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { createCustomer } from '@/server/actions/customers';
import { PageHeader } from '@/components/admin/page-header';
import { CustomerForm } from '@/components/admin/customer-form';

export const metadata: Metadata = { title: 'নতুন কাস্টমার' };

export default async function NewCustomerPage() {
  await requireStaff();
  return (
    <div>
      <PageHeader title="নতুন কাস্টমার" subtitle="ক্রেতার তথ্য (ডিজিটাল ফর্ম §8)" />
      <CustomerForm action={createCustomer} submitLabel="কাস্টমার সংরক্ষণ করুন" />
    </div>
  );
}
