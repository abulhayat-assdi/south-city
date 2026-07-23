'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { setActiveProject } from '@/server/actions/project-switch';
import type { ProjectOption } from '@/server/projects';

export function ProjectSwitcher({
  projects,
  active,
}: {
  projects: ProjectOption[];
  active: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <label className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5 text-sm">
      <Building2 className="size-4 text-navy" />
      <select
        value={active ?? 'all'}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            await setActiveProject(e.target.value);
            router.refresh();
          })
        }
        className="max-w-[10rem] bg-transparent text-sm font-medium text-ink outline-none"
        aria-label="প্রজেক্ট নির্বাচন"
      >
        <option value="all">সব প্রজেক্ট</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nameBn ?? p.nameEn}
          </option>
        ))}
      </select>
    </label>
  );
}
