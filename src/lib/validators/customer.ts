import { z } from 'zod';

// Bangladeshi mobile: 01XXXXXXXXX (11 digits). Spec §8.
const phone = z
  .string()
  .trim()
  .regex(/^01\d{9}$/, 'ফোন নম্বর 01XXXXXXXXX ফরম্যাটে দিন');

const optionalPhone = z
  .string()
  .trim()
  .regex(/^01\d{9}$/, 'ফোন নম্বর 01XXXXXXXXX ফরম্যাটে দিন')
  .optional()
  .or(z.literal(''));

// NID: 10, 13 or 17 digits.
const optionalNid = z
  .string()
  .trim()
  .regex(/^(\d{10}|\d{13}|\d{17})$/, 'NID ১০/১৩/১৭ সংখ্যার হতে হবে')
  .optional()
  .or(z.literal(''));

const opt = (max = 255) => z.string().trim().max(max).optional().or(z.literal(''));

export const customerSchema = z.object({
  // buyer
  fullNameEn: z.string().trim().min(1, 'নাম (English) দিন').max(120),
  fullNameBn: opt(120),
  fatherName: opt(120),
  motherName: opt(120),
  spouseName: opt(120),
  nidNumber: optionalNid,
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'জন্মতারিখ সঠিক নয়'),
  occupation: opt(80),
  nationality: z.string().trim().max(60).optional().or(z.literal('')).transform((v) => v || 'Bangladeshi'),
  phonePrimary: phone,
  phoneSecondary: optionalPhone,
  email: z.string().trim().email('ইমেইল সঠিক নয়').optional().or(z.literal('')),
  // addresses
  presentAddress: opt(400),
  permanentAddress: opt(400),
  // nominee
  nomineeName: opt(120),
  nomineeRelation: opt(60),
  nomineeNid: optionalNid,
  nomineePhone: optionalPhone,
  nomineeAddress: opt(400),
  // misc
  notes: opt(1000),
});

export type CustomerInput = z.infer<typeof customerSchema>;
