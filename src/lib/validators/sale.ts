import { z } from 'zod';

const decimalString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'সঠিক টাকার অঙ্ক দিন');

const dateString = z
  .string()
  .trim()
  .min(1, 'তারিখ দিন')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'তারিখ সঠিক নয়');

export const saleSchema = z
  .object({
    projectId: z.string().trim().min(1, 'প্রজেক্ট নির্বাচন করুন'),
    plotId: z.string().trim().min(1, 'প্লট নির্বাচন করুন'),
    customerId: z.string().trim().min(1, 'কাস্টমার নির্বাচন করুন'),
    salePrice: decimalString,
    downPayment: decimalString.optional().or(z.literal('')).transform((v) => v || '0'),
    paymentType: z.enum(['FULL', 'INSTALLMENT']),
    installmentCount: z.coerce.number().int().positive().max(600).optional().or(z.literal('').transform(() => undefined)),
    installmentStartDate: z.string().trim().optional().or(z.literal('')),
    bookingDate: dateString,
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (d) => d.paymentType === 'FULL' || (d.installmentCount && d.installmentCount > 0),
    { message: 'কিস্তির সংখ্যা দিন', path: ['installmentCount'] },
  )
  .refine(
    (d) => d.paymentType === 'FULL' || (d.installmentStartDate && !Number.isNaN(Date.parse(d.installmentStartDate))),
    { message: 'প্রথম কিস্তির তারিখ দিন', path: ['installmentStartDate'] },
  );

export type SaleInput = z.infer<typeof saleSchema>;
