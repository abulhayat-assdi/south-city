import { z } from 'zod';

export const plotStatusEnum = z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD']);
export const plotCategoryEnum = z.enum(['RESIDENTIAL', 'COMMERCIAL']);

// A decimal string like "5" or "5.00" — money/size values never go through Float.
const decimalString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'সংখ্যা সঠিক নয়');

export const plotSchema = z.object({
  projectId: z.string().trim().min(1, 'প্রজেক্ট নির্বাচন করুন'),
  sector: z.string().trim().min(1, 'সেক্টর দিন').max(4),
  plotNumber: z.string().trim().min(1, 'প্লট নম্বর দিন').max(20),
  sizeKatha: decimalString,
  category: plotCategoryEnum.default('RESIDENTIAL'),
  roadWidthFt: z.coerce.number().int().positive().optional().or(z.literal('').transform(() => undefined)),
  dimensions: z.string().trim().max(60).optional().or(z.literal('')),
  faceDirection: z.string().trim().max(40).optional().or(z.literal('')),
  status: plotStatusEnum.default('AVAILABLE'),
  basePrice: decimalString.optional().or(z.literal('')),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export type PlotInput = z.infer<typeof plotSchema>;
