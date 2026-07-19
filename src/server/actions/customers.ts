'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';
import { nextCustomerCode } from '@/lib/codes';
import { customerSchema } from '@/lib/validators/customer';
import { hashPassword, generateTempPassword } from '@/lib/password';

export interface CustomerActionState {
  error?: string;
}

function nn(v: string | undefined | null): string | null {
  return v && v !== '' ? v : null;
}

function parse(formData: FormData) {
  return customerSchema.safeParse(Object.fromEntries(formData.entries()));
}

function toData(d: import('@/lib/validators/customer').CustomerInput) {
  return {
    fullNameEn: d.fullNameEn,
    fullNameBn: nn(d.fullNameBn),
    fatherName: nn(d.fatherName),
    motherName: nn(d.motherName),
    spouseName: nn(d.spouseName),
    nidNumber: nn(d.nidNumber),
    dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
    occupation: nn(d.occupation),
    nationality: d.nationality || 'Bangladeshi',
    phonePrimary: d.phonePrimary,
    phoneSecondary: nn(d.phoneSecondary),
    email: nn(d.email),
    presentAddress: nn(d.presentAddress),
    permanentAddress: nn(d.permanentAddress),
    nomineeName: nn(d.nomineeName),
    nomineeRelation: nn(d.nomineeRelation),
    nomineeNid: nn(d.nomineeNid),
    nomineePhone: nn(d.nomineePhone),
    nomineeAddress: nn(d.nomineeAddress),
    notes: nn(d.notes),
  };
}

export async function createCustomer(_prev: CustomerActionState, formData: FormData): Promise<CustomerActionState> {
  const user = await assertPermission('customer:write');
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  let newId = '';
  await prisma.$transaction(async (tx) => {
    const customerCode = await nextCustomerCode(tx);
    const customer = await tx.customer.create({
      data: { customerCode, ...toData(parsed.data) },
    });
    newId = customer.id;
    await writeAudit(tx, { userId: user.id, action: 'CREATE_CUSTOMER', entity: 'Customer', entityId: customer.id, after: customer });
  });

  revalidatePath('/admin/customers');
  redirect(`/admin/customers/${newId}`);
}

export async function updateCustomer(id: string, _prev: CustomerActionState, formData: FormData): Promise<CustomerActionState> {
  const user = await assertPermission('customer:write');
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const before = await prisma.customer.findUnique({ where: { id } });
  if (!before) return { error: 'কাস্টমার পাওয়া যায়নি' };

  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.update({ where: { id }, data: toData(parsed.data) });
    await writeAudit(tx, { userId: user.id, action: 'UPDATE_CUSTOMER', entity: 'Customer', entityId: id, before, after: customer });
  });

  revalidatePath(`/admin/customers/${id}`);
  redirect(`/admin/customers/${id}`);
}

export interface CreateLoginResult {
  error?: string;
  loginEmail?: string;
  tempPassword?: string;
}

/** Create a CUSTOMER login account for this customer (spec §5/§6.3). Returns the
 * one-time credentials to hand over. */
export async function createLoginAccount(customerId: string): Promise<CreateLoginResult> {
  const actor = await assertPermission('customer:write');

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return { error: 'কাস্টমার পাওয়া যায়নি' };
  if (customer.userId) return { error: 'এই কাস্টমারের ইতিমধ্যে লগইন অ্যাকাউন্ট আছে' };

  // Login email: the customer's own email if present, else a stable code-based id.
  const loginEmail = (customer.email ?? `${customer.customerCode.toLowerCase()}@customer.southcity.local`).toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: loginEmail } });
  if (existing) return { error: 'এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে' };

  const tempPassword = generateTempPassword();

  await prisma.$transaction(async (tx) => {
    const account = await tx.user.create({
      data: {
        name: customer.fullNameEn,
        email: loginEmail,
        phone: customer.phonePrimary,
        passwordHash: await hashPassword(tempPassword),
        role: 'CUSTOMER',
        mustChangePassword: true,
      },
    });
    await tx.customer.update({ where: { id: customerId }, data: { userId: account.id } });
    await writeAudit(tx, {
      userId: actor.id,
      action: 'CREATE_CUSTOMER_LOGIN',
      entity: 'User',
      entityId: account.id,
      after: { customerId, loginEmail },
    });
  });

  revalidatePath(`/admin/customers/${customerId}`);
  return { loginEmail, tempPassword };
}
