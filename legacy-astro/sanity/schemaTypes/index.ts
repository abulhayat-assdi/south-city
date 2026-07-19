import { defineField, defineType } from 'sanity';

/* ---------------------------------------------------------- shared types */
// Every visitor-facing string is bilingual: { en, bn } (spec §8)
const localeString = defineType({
  name: 'localeString',
  title: 'Bilingual text',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string' }),
    defineField({ name: 'bn', title: 'বাংলা', type: 'string' }),
  ],
});

const localeText = defineType({
  name: 'localeText',
  title: 'Bilingual long text',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'text', rows: 4 }),
    defineField({ name: 'bn', title: 'বাংলা', type: 'text', rows: 4 }),
  ],
});

const orderRank = defineField({
  name: 'orderRank',
  title: 'Sort order (lower = earlier)',
  type: 'number',
  initialValue: 0,
});

/* ------------------------------------------------------------- documents */
const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'companyName', title: 'Company legal name', type: 'localeString' }),
    defineField({
      name: 'phone',
      title: 'Sales phone (tel: format, e.g. +8801862534626)',
      type: 'string',
    }),
    defineField({ name: 'phoneDisplay', title: 'Phone as displayed', type: 'string' }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp number (wa.me format: 8801XXXXXXXXX — no + or spaces)',
      type: 'string',
      validation: (r) => r.regex(/^880\d{10}$/).warning('Expected 8801XXXXXXXXX'),
    }),
    defineField({ name: 'email', title: 'Public email', type: 'string' }),
    defineField({ name: 'address', title: 'Office address', type: 'localeString' }),
    defineField({
      name: 'social',
      title: 'Social links',
      type: 'object',
      fields: [
        defineField({ name: 'facebook', type: 'url' }),
        defineField({ name: 'youtube', type: 'url' }),
        defineField({ name: 'linkedin', type: 'url' }),
      ],
    }),
  ],
});

const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    defineField({ name: 'headline', title: 'Headline (H1)', type: 'localeString' }),
    defineField({ name: 'subline', title: 'Sub-line', type: 'localeString' }),
    defineField({
      name: 'image',
      title: 'Background image (gateway render, ≥1920px wide)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});

const overview = defineType({
  name: 'overview',
  title: 'Overview',
  type: 'document',
  fields: [
    defineField({ name: 'paragraph', title: 'Intro paragraph', type: 'localeText' }),
    defineField({
      name: 'counters',
      title: 'Counters (4 items)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'end',
              title: 'Number to count up to (empty = no animation)',
              type: 'number',
            }),
            defineField({
              name: 'display',
              title: 'Final display text (e.g. "500+" / "৫০০+")',
              type: 'localeString',
            }),
            defineField({ name: 'label', title: 'Label', type: 'localeString' }),
          ],
        },
      ],
      validation: (r) => r.max(4),
    }),
  ],
});

const trustBadge = defineType({
  name: 'trustBadge',
  title: 'Trust Badges',
  type: 'document',
  // 🔴 spec §6.4: never add a "RAJUK Approved" badge or REHAB logo here —
  // the project does not hold these. Verifiable items only.
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: ['license', 'document', 'stamp', 'calendar', 'landcheck', 'river', 'security', 'check'],
      },
    }),
    defineField({ name: 'label', title: 'Label', type: 'localeString' }),
    orderRank,
  ],
  preview: { select: { title: 'label.en' } },
});

const projectFact = defineType({
  name: 'projectFact',
  title: 'Project Facts (at a glance)',
  type: 'document',
  fields: [
    defineField({ name: 'label', title: 'Label (e.g. Total area)', type: 'localeString' }),
    defineField({ name: 'value', title: 'Value', type: 'localeString' }),
    orderRank,
  ],
  preview: { select: { title: 'label.en', subtitle: 'value.en' } },
});

const plot = defineType({
  name: 'plot',
  title: 'Plot Sizes & Pricing',
  type: 'document',
  fields: [
    defineField({ name: 'katha', title: 'Size (e.g. "3 Katha" / "৩ কাঠা")', type: 'localeString' }),
    defineField({ name: 'sqft', title: 'Area in sq ft', type: 'localeString' }),
    defineField({ name: 'dimensions', title: 'Approx. dimensions', type: 'localeString' }),
    defineField({
      name: 'price',
      title: 'Price (leave empty → shows "Call for price")',
      type: 'localeString',
    }),
    defineField({ name: 'booking', title: 'Booking money', type: 'localeString' }),
    defineField({ name: 'installment', title: 'Installment note', type: 'localeString' }),
  ],
  preview: { select: { title: 'katha.en', subtitle: 'price.en' } },
});

const amenity = defineType({
  name: 'amenity',
  title: 'Amenities',
  type: 'document',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: ['school', 'mosque', 'health', 'shop', 'gym', 'coffee', 'trail', 'park', 'security', 'road', 'utility', 'play'],
      },
    }),
    defineField({ name: 'label', title: 'Label', type: 'localeString' }),
    orderRank,
  ],
  preview: { select: { title: 'label.en' } },
});

const landmarkTab = defineType({
  name: 'landmarkTab',
  title: 'Neighborhood Tabs',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Tab label — keep the English label matching the site tab (Connectivity / Education / Health / Daily Needs)',
      type: 'localeString',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Place', type: 'localeString' }),
            defineField({ name: 'note', title: 'Distance / note', type: 'localeString' }),
          ],
        },
      ],
    }),
    orderRank,
  ],
  preview: { select: { title: 'label.en' } },
});

const masterPlan = defineType({
  name: 'masterPlan',
  title: 'Master Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Master plan / sector layout image (≥1600px wide)',
      type: 'image',
    }),
  ],
});

const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'caption', title: 'Caption', type: 'localeString' }),
    orderRank,
  ],
  preview: { select: { title: 'caption.en', media: 'image' } },
});

const brochure = defineType({
  name: 'brochure',
  title: 'Brochure (PDF)',
  type: 'document',
  fields: [
    defineField({
      name: 'file',
      title: 'Brochure PDF — replaces the site download on next publish',
      type: 'file',
      options: { accept: 'application/pdf' },
    }),
  ],
});

export const schemaTypes = [
  localeString,
  localeText,
  siteSettings,
  hero,
  overview,
  trustBadge,
  projectFact,
  plot,
  amenity,
  landmarkTab,
  masterPlan,
  galleryImage,
  brochure,
];
