import { Badge, type BadgeProps } from '@/components/ui/badge';

const PLOT: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  AVAILABLE: { label: 'খালি', variant: 'success' },
  RESERVED: { label: 'সংরক্ষিত', variant: 'warning' },
  BOOKED: { label: 'বুকড', variant: 'gold' },
  SOLD: { label: 'বিক্রীত', variant: 'default' },
};

const SALE: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  ACTIVE: { label: 'চলমান', variant: 'gold' },
  COMPLETED: { label: 'সম্পন্ন', variant: 'success' },
  CANCELLED: { label: 'বাতিল', variant: 'danger' },
};

const INSTALLMENT: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  PENDING: { label: 'বাকি', variant: 'secondary' },
  PARTIAL: { label: 'আংশিক', variant: 'warning' },
  PAID: { label: 'পরিশোধিত', variant: 'success' },
  OVERDUE: { label: 'মেয়াদোত্তীর্ণ', variant: 'danger' },
};

export function PlotStatusBadge({ status }: { status: string }) {
  const s = PLOT[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function SaleStatusBadge({ status }: { status: string }) {
  const s = SALE[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function InstallmentStatusBadge({ status }: { status: string }) {
  const s = INSTALLMENT[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
