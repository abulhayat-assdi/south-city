'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';
import { saveUpload } from '@/lib/uploads';
import type { DocumentType } from '@prisma/client';

const DOC_TYPES: DocumentType[] = ['NID', 'PHOTO', 'SIGNATURE', 'AGREEMENT', 'DEED', 'MONEY_RECEIPT', 'OTHER'];

export interface DocumentActionState {
  error?: string;
  ok?: boolean;
}

export async function uploadCustomerDocument(
  customerId: string,
  _prev: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const user = await assertPermission('customer:write');

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
  if (!customer) return { error: 'কাস্টমার পাওয়া যায়নি' };

  const type = String(formData.get('type') ?? 'OTHER') as DocumentType;
  if (!DOC_TYPES.includes(type)) return { error: 'ডকুমেন্ট টাইপ সঠিক নয়' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'ফাইল নির্বাচন করুন' };

  let stored;
  try {
    stored = await saveUpload(file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'আপলোড ব্যর্থ' };
  }

  const doc = await prisma.document.create({
    data: {
      type,
      fileUrl: stored.fileUrl,
      fileName: stored.fileName,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      customerId,
      uploadedById: user.id,
    },
  });
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'UPLOAD_DOCUMENT', entity: 'Document', entityId: doc.id, after: { customerId, type } },
  });

  revalidatePath(`/admin/customers/${customerId}`);
  return { ok: true };
}

export async function deleteDocument(id: string): Promise<DocumentActionState> {
  const user = await assertPermission('customer:write');
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return { error: 'ডকুমেন্ট পাওয়া যায়নি' };

  await prisma.document.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'DELETE_DOCUMENT', entity: 'Document', entityId: id, before: doc },
  });
  if (doc.customerId) revalidatePath(`/admin/customers/${doc.customerId}`);
  return { ok: true };
}
