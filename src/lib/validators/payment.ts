import { z } from 'zod';

const decimalString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'সঠিক টাকার অঙ্ক দিন')
  .refine((v) => Number(v) > 0, 'অঙ্ক শূন্যের বেশি হতে হবে');

export const paymentSchema = z.object({
  saleId: z.string().trim().min(1),
  installmentId: z.string().trim().optional().or(z.literal('')),
  amount: decimalString,
  paymentDate: z
    .string()
    .trim()
    .min(1, 'তারিখ দিন')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'তারিখ সঠিক নয়'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'BKASH', 'NAGAD', 'OTHER']),
  referenceNo: z.string().trim().max(80).optional().or(z.literal('')),
  note: z.string().trim().max(500).optional().or(z.literal('')),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
