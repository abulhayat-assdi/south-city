import type { Role } from '@prisma/client';
import {
  LayoutDashboard,
  Building2,
  MapPinned,
  Users,
  FileSignature,
  Receipt,
  BarChart3,
  UserCog,
  Globe,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  labelBn: string;
  labelEn: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', labelBn: 'প্রজেক্ট', labelEn: 'Projects', icon: Building2 },
  { href: '/admin/plots', labelBn: 'প্লট', labelEn: 'Plots', icon: MapPinned },
  { href: '/admin/customers', labelBn: 'কাস্টমার', labelEn: 'Customers', icon: Users },
  { href: '/admin/sales', labelBn: 'বিক্রয়', labelEn: 'Sales', icon: FileSignature },
  { href: '/admin/payments', labelBn: 'পেমেন্ট', labelEn: 'Payments', icon: Receipt },
  { href: '/admin/reports', labelBn: 'রিপোর্ট', labelEn: 'Reports', icon: BarChart3 },
  { href: '/admin/content', labelBn: 'কনটেন্ট', labelEn: 'Content', icon: Globe, adminOnly: true },
  { href: '/admin/users', labelBn: 'ইউজার', labelEn: 'Users', icon: UserCog, adminOnly: true },
  { href: '/admin/audit', labelBn: 'অডিট লগ', labelEn: 'Audit log', icon: ScrollText, adminOnly: true },
];

export function visibleNav(role: Role): NavItem[] {
  return ADMIN_NAV.filter((item) => !item.adminOnly || role === 'ADMIN');
}
