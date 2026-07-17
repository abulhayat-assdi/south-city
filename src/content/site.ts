/**
 * Local site content — the single source of truth when Sanity is not
 * connected, and the shape mirror of the Sanity schemas (sanity/schemas).
 * Every visitor-facing string is a bilingual { en, bn } object.
 *
 * 🔴 PLACEHOLDERS pending owner confirmation (see spec §10) are marked below.
 */
import type { L10n } from '../i18n/ui';

export interface Counter {
  end: number | null; // numeric target for the count-up animation (null = static)
  display: L10n; // final text shown (supports Bangla numerals / non-numeric)
  label: L10n;
}

export const settings = {
  brand: 'South City',
  // 🔴 legal name unconfirmed: brochure says "South Dhaka Properties & Housing Ltd."
  companyName: {
    en: 'South Dhaka Properties & Housing Ltd.',
    bn: 'সাউথ ঢাকা প্রপার্টিজ অ্যান্ড হাউজিং লিমিটেড',
  } as L10n,
  // 🔴 phone unconfirmed — placeholder from spec §10
  phone: '+8801862534626',
  phoneDisplay: '01862-534626',
  whatsapp: '8801862534626', // wa.me format: no +, no spaces
  // 🔴 email unconfirmed — placeholder from spec §10
  email: 'contact.southcity2020@gmail.com',
  // 🔴 office address unconfirmed — placeholder from spec §10
  address: {
    en: 'Rahman Chamber (Level 4), Motijheel C/A, Dhaka-1000',
    bn: 'রহমান চেম্বার (লেভেল ৪), মতিঝিল বা/এ, ঢাকা-১০০০',
  } as L10n,
  social: {
    facebook: 'https://www.facebook.com/', // 🔴 placeholder URL
    youtube: 'https://www.youtube.com/', // 🔴 placeholder URL
    linkedin: 'https://www.linkedin.com/', // 🔴 placeholder URL
  },
  brochureUrl: '/brochure/south-city-brochure.pdf',
  mapQuery: 'Sayedpur, South Keraniganj, Dhaka',
  waText: {
    en: "Assalamu Alaikum, I'm interested in South City plots.",
    bn: 'আসসালামু আলাইকুম, আমি সাউথ সিটির প্লট সম্পর্কে জানতে আগ্রহী।',
  } as L10n,
};

export const waLink = (lang: 'en' | 'bn', text?: string) =>
  `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text ?? settings.waText[lang])}`;

/* ------------------------------------------------------------------ hero */
export const hero = {
  headline: {
    en: 'Where Your Dream Finds Its Address',
    bn: 'যেখানে আপনার স্বপ্ন খুঁজে পায় ঠিকানা',
  } as L10n,
  subline: {
    en: 'Planned residential & commercial plots beside the Dhaka–Mawa Expressway, Sayedpur.',
    bn: 'ঢাকা–মাওয়া এক্সপ্রেসওয়ের পাশে, সায়েদপুরে পরিকল্পিত আবাসিক ও বাণিজ্যিক প্লট।',
  } as L10n,
  chips: [
    { en: 'Prime Location', bn: 'প্রাইম লোকেশন' },
    { en: 'Legal Security', bn: 'আইনি নিরাপত্তা' },
    { en: 'High Growth', bn: 'উচ্চ প্রবৃদ্ধি' },
    { en: 'Family Focused', bn: 'পরিবারবান্ধব' },
    { en: 'Premium Amenities', bn: 'প্রিমিয়াম সুবিধা' },
  ] as L10n[],
};

/* -------------------------------------------------------------- overview */
export const overview = {
  paragraph: {
    en: 'South City is a ~500-bigha planned residential & commercial land development on the banks of the Dhaleshwari river in Sayedpur, South Keraniganj — minutes from the Dhaka–Mawa Expressway. Four thoughtfully laid-out sectors, 25–60 ft roads, and everyday facilities like schools, a central mosque and a health centre are growing into a complete township, while installment plans of up to 5 years keep ownership within reach.',
    bn: 'সাউথ সিটি — দক্ষিণ কেরানীগঞ্জের সায়েদপুরে, ধলেশ্বরী নদীর তীরে প্রায় ৫০০ বিঘার একটি পরিকল্পিত আবাসিক ও বাণিজ্যিক ল্যান্ড ডেভেলপমেন্ট প্রকল্প — ঢাকা–মাওয়া এক্সপ্রেসওয়ে থেকে মাত্র কয়েক মিনিটের দূরত্বে। চারটি সুপরিকল্পিত সেক্টর, ২৫–৬০ ফুট প্রশস্ত রাস্তা, আর স্কুল, কেন্দ্রীয় মসজিদ ও হেলথ সেন্টারসহ দৈনন্দিন সব সুবিধা নিয়ে গড়ে উঠছে একটি পূর্ণাঙ্গ টাউনশিপ; সঙ্গে রয়েছে ৫ বছর পর্যন্ত সহজ কিস্তির সুবিধা।',
  } as L10n,
  counters: [
    {
      end: 500,
      display: { en: '500+', bn: '৫০০+' },
      label: { en: 'Bigha planned township', bn: 'বিঘা পরিকল্পিত প্রকল্প' },
    },
    {
      end: 4,
      display: { en: '4', bn: '৪' },
      label: { en: 'Residential & commercial sectors', bn: 'আবাসিক ও বাণিজ্যিক সেক্টর' },
    },
    {
      end: null,
      display: { en: '3·5·10', bn: '৩·৫·১০' },
      label: { en: 'Katha plot sizes', bn: 'কাঠা প্লট সাইজ' },
    },
    {
      end: 40,
      display: { en: '40%', bn: '৪০%' },
      label: { en: 'Land already acquired', bn: 'জমি ইতিমধ্যে অধিগ্রহণকৃত' },
    },
  ] as Counter[],
};

/* ------------------------------------------------------------- trust row */
// 🔴 Spec rule: NO "RAJUK Approved" badge, NO REHAB logo. Verifiable items only.
export const trustBadges: { icon: string; label: L10n }[] = [
  { icon: 'license', label: { en: 'Valid Trade License', bn: 'বৈধ ট্রেড লাইসেন্স' } },
  { icon: 'document', label: { en: 'Transparent Documentation', bn: 'স্বচ্ছ ডকুমেন্টেশন' } },
  { icon: 'stamp', label: { en: 'Registration on Full Payment', bn: 'সম্পূর্ণ মূল্য পরিশোধে রেজিস্ট্রেশন' } },
  { icon: 'calendar', label: { en: 'Up to 5-Year Installments', bn: '৫ বছর পর্যন্ত কিস্তি সুবিধা' } },
  { icon: 'landcheck', label: { en: '40% Land Already Acquired', bn: '৪০% জমি অধিগ্রহণ সম্পন্ন' } },
  { icon: 'river', label: { en: 'Dhaleshwari Riverside', bn: 'ধলেশ্বরী নদীতীরবর্তী' } },
];

/* ---------------------------------------------------------------- facts */
export const facts: { label: L10n; value: L10n }[] = [
  { label: { en: 'Project', bn: 'প্রকল্প' }, value: { en: 'South City', bn: 'সাউথ সিটি' } },
  {
    label: { en: 'Developer', bn: 'ডেভেলপার' },
    value: {
      en: 'South Dhaka Properties & Housing Ltd.',
      bn: 'সাউথ ঢাকা প্রপার্টিজ অ্যান্ড হাউজিং লিমিটেড',
    },
  },
  {
    label: { en: 'Total area', bn: 'মোট আয়তন' },
    value: { en: '~500 Bigha (planned)', bn: 'প্রায় ৫০০ বিঘা (পরিকল্পিত)' },
  },
  { label: { en: 'Sectors', bn: 'সেক্টর' }, value: { en: '4 (A, B, C, D)', bn: '৪টি (এ, বি, সি, ডি)' } },
  {
    label: { en: 'Plot types', bn: 'প্লটের ধরন' },
    value: { en: 'Residential & Commercial', bn: 'আবাসিক ও বাণিজ্যিক' },
  },
  {
    label: { en: 'Plot sizes', bn: 'প্লট সাইজ' },
    value: { en: '3 · 5 · 10 Katha', bn: '৩ · ৫ · ১০ কাঠা' },
  },
  {
    label: { en: 'Road width', bn: 'রাস্তার প্রশস্ততা' },
    value: { en: '25 / 40 / 60 ft (60 ft main boulevard)', bn: '২৫ / ৪০ / ৬০ ফুট (৬০ ফুট প্রধান সড়ক)' },
  },
  {
    label: { en: 'Payment', bn: 'পেমেন্ট' },
    value: {
      en: 'Registration on full payment · installments up to 5 years',
      bn: 'সম্পূর্ণ মূল্য পরিশোধে রেজিস্ট্রেশন · ৫ বছর পর্যন্ত কিস্তি',
    },
  },
];

/* ------------------------------------------------------------ master plan */
export interface Hotspot {
  id: string;
  x: number; // % from left
  y: number; // % from top
  name: L10n;
  desc: L10n;
}

export const hotspots: Hotspot[] = [
  {
    id: 'sector-a', x: 25, y: 24,
    name: { en: 'Sector A', bn: 'সেক্টর এ' },
    desc: {
      en: 'Residential sector nearest to KC Road — 3 & 5 Katha plots on 25–40 ft roads.',
      bn: 'কেসি রোড সংলগ্ন আবাসিক সেক্টর — ২৫–৪০ ফুট রাস্তায় ৩ ও ৫ কাঠার প্লট।',
    },
  },
  {
    id: 'sector-b', x: 65, y: 24,
    name: { en: 'Sector B', bn: 'সেক্টর বি' },
    desc: {
      en: 'Premium residential sector — 5 & 10 Katha plots beside the 60 ft boulevard.',
      bn: 'প্রিমিয়াম আবাসিক সেক্টর — ৬০ ফুট প্রধান সড়কের পাশে ৫ ও ১০ কাঠার প্লট।',
    },
  },
  {
    id: 'sector-c', x: 25, y: 75,
    name: { en: 'Sector C', bn: 'সেক্টর সি' },
    desc: {
      en: 'Mixed sector — residential plots plus the commercial area on the main road.',
      bn: 'মিশ্র সেক্টর — আবাসিক প্লটের সাথে প্রধান সড়কে বাণিজ্যিক এলাকা।',
    },
  },
  {
    id: 'sector-d', x: 65, y: 75,
    name: { en: 'Sector D', bn: 'সেক্টর ডি' },
    desc: {
      en: 'Riverside residential sector along the Dhaleshwari embankment road.',
      bn: 'ধলেশ্বরী বাঁধ সড়ক ঘেঁষা নদীতীরবর্তী আবাসিক সেক্টর।',
    },
  },
  {
    id: 'mosque', x: 45, y: 41,
    name: { en: 'Central Mosque', bn: 'কেন্দ্রীয় মসজিদ' },
    desc: {
      en: 'A landmark central mosque at the heart of the project.',
      bn: 'প্রকল্পের কেন্দ্রস্থলে দৃষ্টিনন্দন কেন্দ্রীয় মসজিদ।',
    },
  },
  {
    id: 'school', x: 21, y: 40,
    name: { en: 'School Zone', bn: 'স্কুল জোন' },
    desc: {
      en: 'Dedicated zone for schools and educational facilities.',
      bn: 'স্কুল ও শিক্ষা প্রতিষ্ঠানের জন্য নির্ধারিত জোন।',
    },
  },
  {
    id: 'health', x: 71, y: 40,
    name: { en: 'Health Centre', bn: 'হেলথ সেন্টার' },
    desc: {
      en: 'On-site health centre for everyday medical needs.',
      bn: 'দৈনন্দিন চিকিৎসা সেবার জন্য প্রকল্পের নিজস্ব হেলথ সেন্টার।',
    },
  },
  {
    id: 'commercial', x: 22, y: 57,
    name: { en: 'Commercial Area', bn: 'বাণিজ্যিক এলাকা' },
    desc: {
      en: 'Shops, offices and a super shop on the 60 ft boulevard.',
      bn: '৬০ ফুট সড়কে দোকান, অফিস ও সুপার শপ।',
    },
  },
  {
    id: 'park', x: 71, y: 57,
    name: { en: 'Green Park', bn: 'সবুজ পার্ক' },
    desc: {
      en: 'Open green park with walking trails and a children’s play area.',
      bn: 'ওয়াকিং ট্রেইল ও শিশুদের খেলার জায়গাসহ উন্মুক্ত সবুজ পার্ক।',
    },
  },
];

/* ----------------------------------------------------------------- plots */
export interface Plot {
  id: string;
  katha: L10n;
  sqft: L10n;
  dimensions: L10n;
  price: L10n | null; // null → "Call for price"
  booking: L10n;
  installment: L10n;
}

// 🔴 prices unconfirmed → all "Call for price" (spec §10)
export const plots: Plot[] = [
  {
    id: 'katha-3',
    katha: { en: '3 Katha', bn: '৩ কাঠা' },
    sqft: { en: '2,160 sq ft', bn: '২,১৬০ বর্গফুট' },
    dimensions: { en: '≈ 36 ft × 60 ft', bn: '≈ ৩৬ ফুট × ৬০ ফুট' },
    price: null,
    booking: { en: 'Call for details', bn: 'বিস্তারিত জানতে কল করুন' },
    installment: {
      en: 'Easy installments up to 5 years — or register instantly on full payment.',
      bn: '৫ বছর পর্যন্ত সহজ কিস্তি — অথবা সম্পূর্ণ মূল্য পরিশোধে তাৎক্ষণিক রেজিস্ট্রেশন।',
    },
  },
  {
    id: 'katha-5',
    katha: { en: '5 Katha', bn: '৫ কাঠা' },
    sqft: { en: '3,600 sq ft', bn: '৩,৬০০ বর্গফুট' },
    dimensions: { en: '≈ 50 ft × 72 ft', bn: '≈ ৫০ ফুট × ৭২ ফুট' },
    price: null,
    booking: { en: 'Call for details', bn: 'বিস্তারিত জানতে কল করুন' },
    installment: {
      en: 'Easy installments up to 5 years — or register instantly on full payment.',
      bn: '৫ বছর পর্যন্ত সহজ কিস্তি — অথবা সম্পূর্ণ মূল্য পরিশোধে তাৎক্ষণিক রেজিস্ট্রেশন।',
    },
  },
  {
    id: 'katha-10',
    katha: { en: '10 Katha', bn: '১০ কাঠা' },
    sqft: { en: '7,200 sq ft', bn: '৭,২০০ বর্গফুট' },
    dimensions: { en: '≈ 72 ft × 100 ft', bn: '≈ ৭২ ফুট × ১০০ ফুট' },
    price: null,
    booking: { en: 'Call for details', bn: 'বিস্তারিত জানতে কল করুন' },
    installment: {
      en: 'Easy installments up to 5 years — or register instantly on full payment.',
      bn: '৫ বছর পর্যন্ত সহজ কিস্তি — অথবা সম্পূর্ণ মূল্য পরিশোধে তাৎক্ষণিক রেজিস্ট্রেশন।',
    },
  },
];

/* -------------------------------------------------------------- location */
export const distances: { place: L10n; value: L10n }[] = [
  { place: { en: 'Dhaka city', bn: 'ঢাকা শহর' }, value: { en: '22 km', bn: '২২ কিমি' } },
  {
    place: { en: 'Dhaka–Mawa Expressway', bn: 'ঢাকা–মাওয়া এক্সপ্রেসওয়ে' },
    value: { en: '1.5 km', bn: '১.৫ কিমি' },
  },
  { place: { en: 'Padma Bridge', bn: 'পদ্মা সেতু' }, value: { en: '12 km', bn: '১২ কিমি' } },
  { place: { en: 'Keraniganj', bn: 'কেরানীগঞ্জ' }, value: { en: '6 km', bn: '৬ কিমি' } },
  {
    place: { en: 'Hazrat Shahjalal Airport', bn: 'হযরত শাহজালাল বিমানবন্দর' },
    value: { en: '30–35 min', bn: '৩০–৩৫ মিনিট' },
  },
];

export const boundaries: { side: L10n; value: L10n }[] = [
  { side: { en: 'West', bn: 'পশ্চিমে' }, value: { en: 'KC Road', bn: 'কেসি রোড' } },
  {
    side: { en: 'East', bn: 'পূর্বে' },
    value: { en: 'Dhaleshwari River & embankment road', bn: 'ধলেশ্বরী নদী ও বাঁধ সড়ক' },
  },
  { side: { en: 'North', bn: 'উত্তরে' }, value: { en: 'Sayedpur Para', bn: 'সায়েদপুর পাড়া' } },
  { side: { en: 'South', bn: 'দক্ষিণে' }, value: { en: 'Nimtali', bn: 'নিমতলী' } },
];

/* ------------------------------------------------------------- landmarks */
export interface LandmarkTab {
  id: string;
  label: L10n;
  image: 'connectivity' | 'education' | 'health' | 'daily';
  items: { name: L10n; note: L10n }[];
}

export const landmarkTabs: LandmarkTab[] = [
  {
    id: 'connectivity',
    label: { en: 'Connectivity', bn: 'যোগাযোগ' },
    image: 'connectivity',
    items: [
      { name: { en: 'KC Road', bn: 'কেসি রোড' }, note: { en: 'Adjacent (west boundary)', bn: 'সংলগ্ন (পশ্চিম সীমানা)' } },
      { name: { en: 'Dhaka–Mawa Expressway', bn: 'ঢাকা–মাওয়া এক্সপ্রেসওয়ে' }, note: { en: '1.5 km', bn: '১.৫ কিমি' } },
      { name: { en: 'Eastern Bypass', bn: 'ইস্টার্ন বাইপাস' }, note: { en: 'Nearby', bn: 'নিকটে' } },
      { name: { en: 'Padma Bridge', bn: 'পদ্মা সেতু' }, note: { en: '12 km', bn: '১২ কিমি' } },
      { name: { en: 'Dhaka city centre', bn: 'ঢাকা শহরকেন্দ্র' }, note: { en: '22 km', bn: '২২ কিমি' } },
    ],
  },
  {
    id: 'education',
    label: { en: 'Education', bn: 'শিক্ষা' },
    image: 'education',
    items: [
      { name: { en: 'On-site school zone', bn: 'প্রকল্পের নিজস্ব স্কুল জোন' }, note: { en: 'Planned within South City', bn: 'সাউথ সিটির ভেতরে পরিকল্পিত' } },
      { name: { en: 'Keraniganj schools & colleges', bn: 'কেরানীগঞ্জের স্কুল ও কলেজ' }, note: { en: 'Within 6 km', bn: '৬ কিমির মধ্যে' } },
      { name: { en: 'Dhaka universities', bn: 'ঢাকার বিশ্ববিদ্যালয়সমূহ' }, note: { en: 'Via expressway, ~30 min', bn: 'এক্সপ্রেসওয়ে হয়ে ~৩০ মিনিট' } },
    ],
  },
  {
    id: 'health',
    label: { en: 'Health', bn: 'স্বাস্থ্যসেবা' },
    image: 'health',
    items: [
      { name: { en: 'On-site health centre', bn: 'প্রকল্পের নিজস্ব হেলথ সেন্টার' }, note: { en: 'Planned within South City', bn: 'সাউথ সিটির ভেতরে পরিকল্পিত' } },
      { name: { en: 'Keraniganj health facilities', bn: 'কেরানীগঞ্জের স্বাস্থ্যকেন্দ্র' }, note: { en: 'Within 6 km', bn: '৬ কিমির মধ্যে' } },
      { name: { en: 'Dhaka hospitals', bn: 'ঢাকার হাসপাতালসমূহ' }, note: { en: '~30 min drive', bn: 'গাড়িতে ~৩০ মিনিট' } },
    ],
  },
  {
    id: 'daily',
    label: { en: 'Daily Needs', bn: 'দৈনন্দিন প্রয়োজন' },
    image: 'daily',
    items: [
      { name: { en: 'On-site super shop & commercial area', bn: 'প্রকল্পের সুপার শপ ও বাণিজ্যিক এলাকা' }, note: { en: 'Planned within South City', bn: 'সাউথ সিটির ভেতরে পরিকল্পিত' } },
      { name: { en: 'Local bazaars (Sayedpur / Nimtali)', bn: 'স্থানীয় বাজার (সায়েদপুর / নিমতলী)' }, note: { en: 'Walking distance', bn: 'হাঁটা দূরত্বে' } },
      { name: { en: 'Banks & services, Keraniganj', bn: 'ব্যাংক ও সেবা, কেরানীগঞ্জ' }, note: { en: 'Within 6 km', bn: '৬ কিমির মধ্যে' } },
    ],
  },
];

/* ------------------------------------------------------------- amenities */
export const amenities: { icon: string; label: L10n }[] = [
  { icon: 'school', label: { en: 'Schools', bn: 'স্কুল' } },
  { icon: 'mosque', label: { en: 'Mosques', bn: 'মসজিদ' } },
  { icon: 'health', label: { en: 'Health Centre', bn: 'হেলথ সেন্টার' } },
  { icon: 'shop', label: { en: 'Super Shop', bn: 'সুপার শপ' } },
  { icon: 'gym', label: { en: 'Gym', bn: 'জিম' } },
  { icon: 'coffee', label: { en: 'Coffee Shop', bn: 'কফি শপ' } },
  { icon: 'trail', label: { en: 'Walking Trails', bn: 'ওয়াকিং ট্রেইল' } },
  { icon: 'park', label: { en: 'Green Open Spaces', bn: 'সবুজ উন্মুক্ত স্থান' } },
  { icon: 'security', label: { en: '24/7 Security', bn: '২৪/৭ নিরাপত্তা' } },
  { icon: 'road', label: { en: 'Wide Roads', bn: 'প্রশস্ত রাস্তা' } },
  { icon: 'utility', label: { en: 'Backup Utilities', bn: 'ব্যাকআপ ইউটিলিটি' } },
  { icon: 'play', label: { en: "Children's Play Area", bn: 'শিশুদের খেলার জায়গা' } },
];

/* --------------------------------------------------------------- gallery */
export const galleryCaptions: L10n[] = [
  { en: 'Gateway entrance render', bn: 'প্রবেশদ্বারের রেন্ডার' },
  { en: '60 ft main boulevard', bn: '৬০ ফুট প্রধান সড়ক' },
  { en: 'Central mosque render', bn: 'কেন্দ্রীয় মসজিদের রেন্ডার' },
  { en: 'Green park & trails', bn: 'সবুজ পার্ক ও ট্রেইল' },
  { en: 'Dhaleshwari riverside', bn: 'ধলেশ্বরী নদীতীর' },
  { en: 'Plot development progress', bn: 'প্লট উন্নয়নের অগ্রগতি' },
];

/* -------------------------------------------------- lead form / Web3Forms */
// 🔴 placeholder — create a free key at https://web3forms.com and set it here
// or via the PUBLIC_WEB3FORMS_KEY environment variable.
export const WEB3FORMS_KEY =
  import.meta.env.PUBLIC_WEB3FORMS_KEY ?? 'YOUR_WEB3FORMS_ACCESS_KEY';
