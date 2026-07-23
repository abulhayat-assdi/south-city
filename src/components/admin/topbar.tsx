import { logoutAction } from '@/server/actions/logout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Role } from '@prisma/client';
import { LogOut } from 'lucide-react';
import { ProjectSwitcher } from './project-switcher';
import type { ProjectOption } from '@/server/projects';

const roleLabel: Record<Role, string> = {
  ADMIN: 'অ্যাডমিন',
  STAFF: 'স্টাফ',
  CUSTOMER: 'কাস্টমার',
};

export function Topbar({
  name,
  role,
  projects,
  activeProject,
}: {
  name?: string | null;
  role: Role;
  projects: ProjectOption[];
  activeProject: string | null;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-line bg-white px-4 sm:px-6">
      <ProjectSwitcher projects={projects} active={activeProject} />
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium text-ink">{name}</div>
        </div>
        <Badge variant="gold">{roleLabel[role]}</Badge>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
