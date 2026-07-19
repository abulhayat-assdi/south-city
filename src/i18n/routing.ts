import { defineRouting } from 'next-intl/routing';

// Public marketing site is bilingual: Bangla is the default (no URL prefix),
// English lives under /en (spec §12). Admin & portal use fixed Bangla labels
// and are not locale-routed.
export const routing = defineRouting({
  locales: ['bn', 'en'],
  defaultLocale: 'bn',
  localePrefix: 'as-needed', // "/" = bn, "/en" = English
});

export type Locale = (typeof routing.locales)[number];
