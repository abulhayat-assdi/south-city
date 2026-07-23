// Lightweight bilingual helpers for the public marketing site (spec §13).
// Bangla is the default (served at "/"); English is served under "/en".
export type Lang = 'bn' | 'en';

/** Pick the localized string, falling back to the other language, then ''. */
export function pick(lang: Lang, en?: string | null, bn?: string | null): string {
  if (lang === 'bn') return (bn || en) ?? '';
  return (en || bn) ?? '';
}

/** Prefix an internal href with /en when in English. */
export function localePath(lang: Lang, path: string): string {
  if (lang === 'bn') return path;
  return path === '/' ? '/en' : `/en${path}`;
}

/** UI micro-strings shared across public pages. */
export const T = {
  nav: {
    home: { en: 'Home', bn: 'হোম' },
    about: { en: 'About', bn: 'পরিচিতি' },
    projects: { en: 'Projects', bn: 'প্রজেক্ট' },
    news: { en: 'News', bn: 'নিউজ' },
    contact: { en: 'Contact', bn: 'যোগাযোগ' },
    chairman: { en: "Chairman's Message", bn: 'চেয়ারম্যানের বাণী' },
    md: { en: "MD's Message", bn: 'এমডির বাণী' },
    login: { en: 'Login', bn: 'লগইন' },
  },
  cta: {
    viewProject: { en: 'View project', bn: 'প্রজেক্ট দেখুন' },
    getDetails: { en: 'Get plot details', bn: 'প্লটের তথ্য নিন' },
    whatsapp: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
    call: { en: 'Call now', bn: 'কল করুন' },
    brochure: { en: 'Download brochure', bn: 'ব্রোশিওর ডাউনলোড' },
    enquire: { en: 'Send enquiry', bn: 'অনুসন্ধান পাঠান' },
    allProjects: { en: 'All projects', bn: 'সব প্রজেক্ট' },
  },
  sections: {
    ourProjects: { en: 'Our Projects', bn: 'আমাদের প্রজেক্ট' },
    whyUs: { en: 'Why Choose Us', bn: 'কেন আমরা' },
    latestNews: { en: 'Latest News', bn: 'সর্বশেষ খবর' },
    overview: { en: 'Overview', bn: 'সংক্ষিপ্ত বিবরণ' },
    atGlance: { en: 'At a Glance', bn: 'এক নজরে' },
    masterPlan: { en: 'Master Plan', bn: 'মাস্টার প্ল্যান' },
    plotSizes: { en: 'Plot Sizes', bn: 'প্লট সাইজ' },
    location: { en: 'Location', bn: 'অবস্থান' },
    amenities: { en: 'Amenities', bn: 'সুযোগ-সুবিধা' },
    gallery: { en: 'Gallery', bn: 'গ্যালারি' },
    landmarks: { en: 'Nearby', bn: 'আশেপাশে' },
    enquiry: { en: 'Enquiry', bn: 'অনুসন্ধান' },
    vision: { en: 'Vision', bn: 'ভিশন' },
    mission: { en: 'Mission', bn: 'মিশন' },
    coreValues: { en: 'Core Values', bn: 'মূল্যবোধ' },
  },
  callForPrice: { en: 'Call for price', bn: 'মূল্যের জন্য কল করুন' },
} as const;

export const tt = (lang: Lang, pair: { en: string; bn: string }) => (lang === 'bn' ? pair.bn : pair.en);
