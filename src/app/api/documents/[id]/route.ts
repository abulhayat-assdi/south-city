import { NextResponse } from 'next/server';
import { currentUser } from '@/server/session';
import { isStaff } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { readUpload } from '@/lib/uploads';

// Documents are served ONLY through this route, with an ownership check
// (spec §6.6/§13). ADMIN/STAFF may fetch any; a CUSTOMER may fetch only their own.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      customer: { select: { userId: true } },
      sale: { select: { customer: { select: { userId: true } } } },
    },
  });
  if (!doc) return new NextResponse('Not found', { status: 404 });

  if (!isStaff(user.role)) {
    // Customer: allow only if the document belongs to them.
    const ownerUserId = doc.customer?.userId ?? doc.sale?.customer.userId ?? null;
    if (ownerUserId !== user.id) return new NextResponse('Forbidden', { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await readUpload(doc.fileUrl);
  } catch {
    return new NextResponse('File missing', { status: 404 });
  }

  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      'Content-Type': doc.mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
