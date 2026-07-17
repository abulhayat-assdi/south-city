/**
 * All UI copy lives here as { en, bn } objects. Bangla is the default site
 * language ("/" = bn, "/en/" = en).
 */
export type Lang = 'bn' | 'en';
export type L10n = { en: string; bn: string };

export const langs: Lang[] = ['bn', 'en'];
export const defaultLang: Lang = 'bn';

/** Resolve a bilingual object for the active language. */
export const t = (s: L10n, lang: Lang): string => s[lang] ?? s.en;

/** Path of this page in the other language (used by the toggle). */
export const altPath = (lang: Lang): string => (lang === 'bn' ? '/en/' : '/');

export const ui = {
  skipToContent: { en: 'Skip to content', bn: 'মূল কনটেন্টে যান' },

  nav: {
    overview: { en: 'Overview', bn: 'পরিচিতি' },
    masterplan: { en: 'Master Plan', bn: 'মাস্টার প্ল্যান' },
    plots: { en: 'Plots', bn: 'প্লট' },
    location: { en: 'Location', bn: 'লোকেশন' },
    amenities: { en: 'Amenities', bn: 'সুযোগ-সুবিধা' },
    contact: { en: 'Contact', bn: 'যোগাযোগ' },
  },

  header: {
    callNow: { en: 'Call Now', bn: 'কল করুন' },
    menuOpen: { en: 'Open menu', bn: 'মেনু খুলুন' },
    menuClose: { en: 'Close menu', bn: 'মেনু বন্ধ করুন' },
    langLabel: { en: 'ভাষা: বাংলা', bn: 'Language: English' }, // shows the language you SWITCH TO
    langShort: { en: 'বাং', bn: 'EN' },
  },

  hero: {
    eyebrow: { en: 'Sayedpur · South Keraniganj · Dhaka', bn: 'সায়েদপুর · দক্ষিণ কেরানীগঞ্জ · ঢাকা' },
    whatsappUs: { en: 'WhatsApp Us', bn: 'হোয়াটসঅ্যাপ করুন' },
    getDetails: { en: 'Get Plot Details', bn: 'প্লটের বিস্তারিত জানুন' },
    scroll: { en: 'Scroll', bn: 'স্ক্রল করুন' },
  },

  sections: {
    overviewEyebrow: { en: 'Overview', bn: 'পরিচিতি' },
    overviewTitle: { en: 'A Planned Township by the Dhaleshwari', bn: 'ধলেশ্বরীর তীরে পরিকল্পিত টাউনশিপ' },
    trustEyebrow: { en: 'Why trust South City', bn: 'কেন সাউথ সিটিতে আস্থা রাখবেন' },
    trustTitle: { en: 'Buy With Confidence', bn: 'নিশ্চিন্তে বিনিয়োগ করুন' },
    factsEyebrow: { en: 'The project in numbers', bn: 'এক নজরে প্রকল্প' },
    factsTitle: { en: 'Project at a Glance', bn: 'প্রকল্পের মূল তথ্য' },
    planEyebrow: { en: 'Master plan', bn: 'মাস্টার প্ল্যান' },
    planTitle: { en: 'Four Sectors, One Complete City', bn: 'চার সেক্টরে একটি পূর্ণাঙ্গ শহর' },
    planHint: {
      en: 'Tap a marker on the plan to see sector details.',
      bn: 'সেক্টরের তথ্য দেখতে ম্যাপের মার্কারে ট্যাপ করুন।',
    },
    plotsEyebrow: { en: 'Plot sizes & pricing', bn: 'প্লট সাইজ ও মূল্য' },
    plotsTitle: { en: 'Choose Your Plot Size', bn: 'আপনার প্লট সাইজ বেছে নিন' },
    plotsNote: {
      en: '1 Katha = 720 sq ft ≈ 66.9 m² · 1 Bigha = 20 Katha',
      bn: '১ কাঠা = ৭২০ বর্গফুট ≈ ৬৬.৯ বর্গমিটার · ১ বিঘা = ২০ কাঠা',
    },
    locationEyebrow: { en: 'Location & connectivity', bn: 'লোকেশন ও যোগাযোগ' },
    locationTitle: { en: 'Minutes From the Expressway', bn: 'এক্সপ্রেসওয়ে থেকে মাত্র কয়েক মিনিট' },
    landmarksEyebrow: { en: 'Neighborhood', bn: 'আশপাশের এলাকা' },
    landmarksTitle: { en: 'Everything You Need, Nearby', bn: 'প্রয়োজনীয় সবকিছু, হাতের কাছে' },
    amenitiesEyebrow: { en: 'Amenities & facilities', bn: 'সুযোগ-সুবিধা' },
    amenitiesTitle: { en: 'Designed for Family Living', bn: 'পরিবারের জন্য পরিকল্পিত জীবন' },
    galleryEyebrow: { en: 'Gallery', bn: 'গ্যালারি' },
    galleryTitle: { en: 'Master Plan & Project Renders', bn: 'মাস্টার প্ল্যান ও প্রকল্পের রেন্ডার' },
    contactEyebrow: { en: 'Get plot details', bn: 'প্লটের বিস্তারিত' },
    contactTitle: { en: 'Talk to Our Sales Team', bn: 'আমাদের সেলস টিমের সাথে কথা বলুন' },
    contactSub: {
      en: 'Leave your details — we will call you back with plot availability and pricing.',
      bn: 'আপনার তথ্য দিন — প্লটের প্রাপ্যতা ও মূল্যসহ আমরা আপনাকে কল করব।',
    },
  },

  facts: {
    downloadBrochure: { en: 'Download Brochure (PDF)', bn: 'ব্রোশিওর ডাউনলোড করুন (PDF)' },
  },

  plan: {
    enquire: { en: 'Enquire on WhatsApp', bn: 'হোয়াটসঅ্যাপে জানুন' },
    listTitle: { en: 'Sectors & landmarks', bn: 'সেক্টর ও স্থাপনাসমূহ' },
  },

  plots: {
    dimensions: { en: 'Approx. dimensions', bn: 'আনুমানিক মাপ' },
    area: { en: 'Area', bn: 'আয়তন' },
    price: { en: 'Price', bn: 'মূল্য' },
    booking: { en: 'Booking money', bn: 'বুকিং মানি' },
    installment: { en: 'Installments', bn: 'কিস্তি সুবিধা' },
    reserve: { en: 'Reserve this plot', bn: 'এই প্লটটি রিজার্ভ করুন' },
    callForPrice: { en: 'Call for price', bn: 'মূল্যের জন্য কল করুন' },
  },

  location: {
    showMap: { en: 'Show map', bn: 'ম্যাপ দেখুন' },
    mapTitle: { en: 'South City project location map', bn: 'সাউথ সিটি প্রকল্পের লোকেশন ম্যাপ' },
    distancesTitle: { en: 'Distances that matter', bn: 'গুরুত্বপূর্ণ দূরত্বসমূহ' },
    boundaries: { en: 'Project boundaries', bn: 'প্রকল্পের সীমানা' },
  },

  form: {
    name: { en: 'Your name', bn: 'আপনার নাম' },
    phone: { en: 'Phone number (BD)', bn: 'ফোন নম্বর' },
    phoneHint: { en: 'e.g. 01XXXXXXXXX', bn: 'যেমন: 01XXXXXXXXX' },
    plotSize: { en: 'Preferred plot size', bn: 'পছন্দের প্লট সাইজ' },
    plotAny: { en: 'Not sure yet', bn: 'এখনও ঠিক করিনি' },
    message: { en: 'Message (optional)', bn: 'বার্তা (ঐচ্ছিক)' },
    submit: { en: 'Request a Call Back', bn: 'কল ব্যাক চাই' },
    submitting: { en: 'Sending…', bn: 'পাঠানো হচ্ছে…' },
    orWhatsApp: { en: 'Send on WhatsApp instead', bn: 'হোয়াটসঅ্যাপে পাঠান' },
    successTitle: { en: 'Thank you!', bn: 'ধন্যবাদ!' },
    successBody: {
      en: 'We received your request. Our sales team will call you shortly.',
      bn: 'আপনার অনুরোধ পেয়েছি। আমাদের সেলস টিম শীঘ্রই আপনাকে কল করবে।',
    },
    error: {
      en: 'Something went wrong. Please try again or WhatsApp us directly.',
      bn: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা সরাসরি হোয়াটসঅ্যাপ করুন।',
    },
    invalidPhone: {
      en: 'Please enter a valid Bangladeshi mobile number (01XXXXXXXXX).',
      bn: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)।',
    },
  },

  footer: {
    tagline: { en: 'Building Landmark, Creating Legacy.', bn: 'Building Landmark, Creating Legacy.' },
    contact: { en: 'Contact', bn: 'যোগাযোগ' },
    quickLinks: { en: 'Quick Links', bn: 'কুইক লিংক' },
    office: { en: 'Corporate Office', bn: 'কর্পোরেট অফিস' },
    copyright: {
      en: '© 2026 South City · South Dhaka Properties & Housing Ltd. All rights reserved.',
      bn: '© ২০২৬ সাউথ সিটি · সাউথ ঢাকা প্রপার্টিজ অ্যান্ড হাউজিং লিমিটেড। সর্বস্বত্ব সংরক্ষিত।',
    },
  },

  sticky: {
    call: { en: 'Call', bn: 'কল করুন' },
    whatsapp: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
    whatsappAria: { en: 'Chat on WhatsApp', bn: 'হোয়াটসঅ্যাপে চ্যাট করুন' },
  },

  meta: {
    title: {
      en: 'South City — Residential & Commercial Plots in South Keraniganj, Dhaka',
      bn: 'সাউথ সিটি — দক্ষিণ কেরানীগঞ্জে আবাসিক ও বাণিজ্যিক প্লট',
    },
    description: {
      en: 'South City: a ~500-bigha planned residential & commercial land project beside the Dhaka–Mawa Expressway in Sayedpur, South Keraniganj. 3, 5 & 10 Katha plots, installments up to 5 years. Call or WhatsApp today.',
      bn: 'সাউথ সিটি: ঢাকা–মাওয়া এক্সপ্রেসওয়ের পাশে, সায়েদপুর, দক্ষিণ কেরানীগঞ্জে প্রায় ৫০০ বিঘার পরিকল্পিত আবাসিক ও বাণিজ্যিক ল্যান্ড প্রকল্প। ৩, ৫ ও ১০ কাঠার প্লট, ৫ বছর পর্যন্ত কিস্তি। আজই কল বা হোয়াটসঅ্যাপ করুন।',
    },
  },
} as const;
