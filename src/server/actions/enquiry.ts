'use server';

import { prisma } from '@/lib/db';
import { z } from 'zod';

export interface EnquiryState {
  error?: string;
  ok?: boolean;
}

const schema = z.object({
  name: z.string().trim().min(1, 'নাম দিন / Name required').max(120),
  phone: z.string().trim().regex(/^01\d{9}$/, 'ফোন 01XXXXXXXXX'),
  email: z.string().trim().email().optional().or(z.literal('')),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
  projectSlug: z.string().trim().max(60).optional().or(z.literal('')),
  preferredSize: z.string().trim().max(4).optional().or(z.literal('')),
});

/** Public lead form → saves an Enquiry row (spec §6/§7). No live ERP data is exposed. */
export async function submitEnquiry(_prev: EnquiryState, fd: FormData): Promise<EnquiryState> {
  const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  await prisma.enquiry.create({
    data: {
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      message: d.message || null,
      projectSlug: d.projectSlug || null,
      preferredSize: d.preferredSize || null,
      source: 'public-lead-form',
    },
  });
  return { ok: true };
}
