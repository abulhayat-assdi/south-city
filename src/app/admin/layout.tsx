import Link from 'next/link';
import { requireStaff } from '@/server/session';
import { Sidebar } from '@/components/admin/sidebar';
import { Topbar } from '@/components/admin/topbar';
import { listProjectsForSwitcher, getActiveProjectId } from '@/server/projects';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const [projects, activeProject] = await Promise.all([
    listProjectsForSwitcher(),
    getActiveProjectId(),
  ]);

  return (
    <div className="flex min-h-screen bg-bg-soft">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-deep md:flex">
        <Link href="/admin" className="flex h-14 items-center gap-2 px-4 font-display text-lg font-bold text-white">
          <span className="flex size-8 items-center justify-center rounded-md bg-gold text-sm font-bold text-navy-deep">
            SD
          </span>
          <span className="leading-tight">
            South Dhaka
            <span className="block text-[10px] font-normal uppercase tracking-wider text-white/50">
              Properties &amp; Housing
            </span>
          </span>
        </Link>
        <Sidebar role={user.role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={user.name} role={user.role} projects={projects} activeProject={activeProject} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
