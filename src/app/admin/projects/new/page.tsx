import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { createProject } from '@/server/actions/projects';
import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/project-form';

export const metadata: Metadata = { title: 'নতুন প্রজেক্ট' };

export default async function NewProjectPage() {
  await requireStaff();
  return (
    <div>
      <PageHeader title="নতুন প্রজেক্ট যোগ করুন" />
      <ProjectForm action={createProject} submitLabel="প্রজেক্ট সংরক্ষণ করুন" />
    </div>
  );
}
