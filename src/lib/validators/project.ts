import { z } from 'zod';

const opt = (max = 2000) => z.string().trim().max(max).optional().or(z.literal(''));

// A JSON string field — validated as parseable JSON (arrays/objects). Empty = null.
const jsonText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((v) => {
    if (!v) return true;
    try {
      JSON.parse(v);
      return true;
    } catch {
      return false;
    }
  }, 'সঠিক JSON নয়');

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'slug দিন')
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug শুধু ছোট হাতের অক্ষর, সংখ্যা ও hyphen'),
  nameEn: z.string().trim().min(1, 'নাম (English) দিন').max(120),
  nameBn: opt(120),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED']).default('ONGOING'),
  tagline: opt(160),
  logoUrl: opt(400),
  heroImageUrl: opt(400),
  masterPlanUrl: opt(400),
  locationEn: opt(160),
  locationBn: opt(160),
  sizeText: opt(60),
  sectorsText: opt(60),
  plotSizesText: opt(60),
  roadWidthText: opt(60),
  descriptionEn: opt(4000),
  descriptionBn: opt(4000),
  mapEmbedUrl: opt(600),
  brochureUrl: opt(400),
  // structured content stored as JSON (see seed.ts for the shapes)
  amenities: jsonText,
  landmarks: jsonText,
  distances: jsonText,
  boundaries: jsonText,
  plotTypes: jsonText,
  trustItems: jsonText,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.union([z.literal('on'), z.literal('')]).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
