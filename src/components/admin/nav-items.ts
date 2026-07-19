import type { Role } from '@prisma/client';
import {
  LayoutDashboard,
  MapPinned,
  Users,
  FileSignature,
  Receipt,
  BarChart3,
  UserCog,
  Globe,
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
  { href: '/admin/plots', labelBn: 'প্লট', labelEn: 'Plots', icon: MapPinned },
  { href: '/admin/customers', labelBn: 'কাস্টমার', labelEn: 'Customers', icon: Users },
  { href: '/admin/sales', labelBn: 'বিক্রয়', labelEn: 'Sales', icon: FileSignature },
  { href: '/admin/payments', labelBn: 'পেমেন্ট', labelEn: 'Payments', icon: Receipt },
  { href: '/admin/reports', labelBn: 'রিপোর্ট', labelEn: 'Reports', icon: BarChart3 },
  { href: '/admin/users', labelBn: 'ইউজার', labelEn: 'Users', icon: UserCog, adminOnly: true },
  { href: '/admin/site-content', labelBn: 'সাইট কনটেন্ট', labelEn: 'Site content', icon: Globe, adminOnly: true },
];

export function visibleNav(role: Role): NavItem[] {
  return ADMIN_NAV.filter((item) => !item.adminOnly || role === 'ADMIN');
}
