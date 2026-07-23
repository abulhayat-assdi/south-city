import { NextResponse } from 'next/server';
import { currentUser } from '@/server/session';
import { can } from '@/lib/rbac';
import { getActiveProjectId } from '@/server/projects';
import { salesReport, overdueReport, collectionByMethod } from '@/server/services/reports';
import { toCsv, csvResponse } from '@/lib/csv';

// CSV export for reports (spec §12). Auth + report:read required.
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !can(user.role, 'report:read')) return new NextResponse('Forbidden', { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'sales';
  const scope = await getActiveProjectId(url.searchParams.get('project') ?? undefined);
  const f = {
    size: url.searchParams.get('size') ?? undefined,
    sector: url.searchParams.get('sector') ?? undefined,
    type: url.searchParams.get('ptype') ?? undefined,
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
  };

  if (type === 'overdue') {
    const rows = await overdueReport(scope);
    const csv = toCsv(
      ['Project', 'Sale', 'Customer', 'Phone', 'Plot', 'Installment', 'Due date', 'Amount due', 'Amount paid'],
      rows.map((r) => [
        r.sale.project.nameEn,
        r.sale.saleCode,
        r.sale.customer.fullNameEn,
        r.sale.customer.phonePrimary,
        r.sale.plot.plotNumber,
        r.installmentNo,
        r.dueDate.toLocaleDateString('en-GB'),
        r.amountDue.toString(),
        r.amountPaid.toString(),
      ]),
    );
    return csvResponse('overdue-report.csv', csv);
  }

  if (type === 'collection') {
    const rows = await collectionByMethod(scope, f.from, f.to);
    const csv = toCsv(['Method', 'Count', 'Total (BDT)'], rows.map((r) => [r.method, r.count, r.total]));
    return csvResponse('collection-report.csv', csv);
  }

  // default: who-bought-what
  const rows = await salesReport(scope, f);
  const csv = toCsv(
    ['Sale', 'Project', 'Plot', 'Katha', 'Sector', 'Customer', 'Phone', 'Sale price', 'Paid', 'Outstanding', 'Type', 'Status', 'Booking date'],
    rows.map((r) => [
      r.saleCode, r.project, r.plot, r.sizeKatha, r.sector, r.customer, r.phone,
      r.salePrice, r.paid, r.outstanding, r.paymentType, r.status, r.bookingDate,
    ]),
  );
  return csvResponse('sales-report.csv', csv);
}
