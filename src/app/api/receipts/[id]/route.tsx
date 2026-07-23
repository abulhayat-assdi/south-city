import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { currentUser } from '@/server/session';
import { isStaff } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { formatBDT } from '@/lib/money';
import { formatKatha } from '@/lib/katha';
import { ReceiptDocument, type ReceiptData } from '@/server/pdf/receipt';

const METHOD: Record<string, string> = {
  CASH: 'Cash', BANK_TRANSFER: 'Bank Transfer', CHEQUE: 'Cheque', BKASH: 'bKash', NAGAD: 'Nagad', OTHER: 'Other',
};
const dmy = (d: Date) => d.toLocaleDateString('en-GB');

// Money-receipt PDF, generated on demand. Auth + ownership checked (spec §8/§13).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      recordedBy: { select: { name: true } },
      sale: {
        include: {
          project: { select: { nameEn: true } },
          plot: { select: { sector: true, plotNumber: true, sizeKatha: true } },
          customer: { select: { userId: true, fullNameEn: true, customerCode: true } },
        },
      },
    },
  });
  if (!payment) return new NextResponse('Not found', { status: 404 });

  // CUSTOMER may fetch only their own receipt.
  if (!isStaff(user.role) && payment.sale.customer.userId !== user.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  if (payment.isVoided) return new NextResponse('Voided', { status: 410 });

  const company = await prisma.companyProfile.findUnique({ where: { id: 1 } });

  const d: ReceiptData = {
    companyName: company?.nameEn ?? 'South Dhaka Properties & Housing Ltd.',
    companyAddress: company?.addressEn ?? '',
    companyPhone: company?.phone ?? '',
    receiptNo: payment.receiptNo,
    paymentDate: dmy(payment.paymentDate),
    method: METHOD[payment.method] ?? payment.method,
    referenceNo: payment.referenceNo,
    amountText: formatBDT(payment.amount.toString()),
    saleCode: payment.sale.saleCode,
    projectName: payment.sale.project.nameEn,
    plotLabel: `Plot ${payment.sale.plot.plotNumber} · ${formatKatha(payment.sale.plot.sizeKatha.toString())}`,
    customerName: payment.sale.customer.fullNameEn,
    customerCode: payment.sale.customer.customerCode,
    recordedBy: payment.recordedBy.name,
    note: payment.note,
  };

  const buffer = await renderToBuffer(<ReceiptDocument d={d} />);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${payment.receiptNo}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
