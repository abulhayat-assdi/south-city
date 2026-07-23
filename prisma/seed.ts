import { PrismaClient, type PlotCategory, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 12);
}

// ---------------------------------------------------------------- company
const coreValues = [
  { en: 'Integrity & Transparency', bn: 'সততা ও স্বচ্ছতা' },
  { en: 'Customer First', bn: 'গ্রাহক অগ্রাধিকার' },
  { en: 'Quality & Commitment', bn: 'মান ও প্রতিশ্রুতি' },
  { en: 'Legal Assurance', bn: 'আইনি নিশ্চয়তা' },
];

// -------------------------------------------------------- south city content
const amenities = [
  { icon: 'school', en: 'Schools', bn: 'স্কুল' },
  { icon: 'mosque', en: 'Central Mosque', bn: 'কেন্দ্রীয় মসজিদ' },
  { icon: 'health', en: 'Health Centre', bn: 'হেলথ সেন্টার' },
  { icon: 'shop', en: 'Super Shop', bn: 'সুপার শপ' },
  { icon: 'gym', en: 'Gym', bn: 'জিম' },
  { icon: 'coffee', en: 'Coffee Shop', bn: 'কফি শপ' },
  { icon: 'trail', en: 'Walking Trails', bn: 'ওয়াকিং ট্রেইল' },
  { icon: 'park', en: 'Green Open Spaces', bn: 'সবুজ উন্মুক্ত স্থান' },
  { icon: 'security', en: '24/7 Security', bn: '২৪/৭ নিরাপত্তা' },
  { icon: 'road', en: 'Wide Roads', bn: 'প্রশস্ত রাস্তা' },
  { icon: 'utility', en: 'Backup Utilities', bn: 'ব্যাকআপ ইউটিলিটি' },
  { icon: 'play', en: "Children's Play Area", bn: 'শিশুদের খেলার জায়গা' },
];

const trustItems = [
  { icon: 'license', en: 'Valid Trade License', bn: 'বৈধ ট্রেড লাইসেন্স' },
  { icon: 'document', en: 'Transparent Documentation', bn: 'স্বচ্ছ ডকুমেন্টেশন' },
  { icon: 'stamp', en: 'Registration on Full Payment', bn: 'সম্পূর্ণ মূল্য পরিশোধে রেজিস্ট্রেশন' },
  { icon: 'calendar', en: 'Up to 5-Year Installments', bn: '৫ বছর পর্যন্ত কিস্তি সুবিধা' },
  { icon: 'landcheck', en: '40% Land Already Acquired', bn: '৪০% জমি অধিগ্রহণ সম্পন্ন' },
  { icon: 'river', en: 'Dhaleshwari Riverside', bn: 'ধলেশ্বরী নদীতীরবর্তী' },
];

const landmarks = [
  {
    id: 'connectivity',
    labelEn: 'Connectivity',
    labelBn: 'যোগাযোগ',
    image: '/projects/south-city/landmark-connectivity.webp',
    items: [
      { nameEn: 'KC Road', nameBn: 'কেসি রোড', noteEn: 'Adjacent (west boundary)', noteBn: 'সংলগ্ন (পশ্চিম সীমানা)' },
      { nameEn: 'Dhaka–Mawa Expressway', nameBn: 'ঢাকা–মাওয়া এক্সপ্রেসওয়ে', noteEn: '1.5 km', noteBn: '১.৫ কিমি' },
      { nameEn: 'Eastern Bypass', nameBn: 'ইস্টার্ন বাইপাস', noteEn: 'Nearby', noteBn: 'নিকটে' },
      { nameEn: 'Padma Bridge', nameBn: 'পদ্মা সেতু', noteEn: '12 km', noteBn: '১২ কিমি' },
      { nameEn: 'Dhaka city centre', nameBn: 'ঢাকা শহরকেন্দ্র', noteEn: '22 km', noteBn: '২২ কিমি' },
    ],
  },
  {
    id: 'education',
    labelEn: 'Education',
    labelBn: 'শিক্ষা',
    image: '/projects/south-city/landmark-education.webp',
    items: [
      { nameEn: 'On-site school zone', nameBn: 'প্রকল্পের নিজস্ব স্কুল জোন', noteEn: 'Planned within South City', noteBn: 'সাউথ সিটির ভেতরে পরিকল্পিত' },
      { nameEn: 'Keraniganj schools & colleges', nameBn: 'কেরানীগঞ্জের স্কুল ও কলেজ', noteEn: 'Within 6 km', noteBn: '৬ কিমির মধ্যে' },
      { nameEn: 'Dhaka universities', nameBn: 'ঢাকার বিশ্ববিদ্যালয়সমূহ', noteEn: 'Via expressway, ~30 min', noteBn: 'এক্সপ্রেসওয়ে হয়ে ~৩০ মিনিট' },
    ],
  },
  {
    id: 'health',
    labelEn: 'Health',
    labelBn: 'স্বাস্থ্যসেবা',
    image: '/projects/south-city/landmark-health.webp',
    items: [
      { nameEn: 'On-site health centre', nameBn: 'প্রকল্পের নিজস্ব হেলথ সেন্টার', noteEn: 'Planned within South City', noteBn: 'সাউথ সিটির ভেতরে পরিকল্পিত' },
      { nameEn: 'Keraniganj health facilities', nameBn: 'কেরানীগঞ্জের স্বাস্থ্যকেন্দ্র', noteEn: 'Within 6 km', noteBn: '৬ কিমির মধ্যে' },
      { nameEn: 'Dhaka hospitals', nameBn: 'ঢাকার হাসপাতালসমূহ', noteEn: '~30 min drive', noteBn: 'গাড়িতে ~৩০ মিনিট' },
    ],
  },
  {
    id: 'daily',
    labelEn: 'Daily Needs',
    labelBn: 'দৈনন্দিন প্রয়োজন',
    image: '/projects/south-city/landmark-daily.webp',
    items: [
      { nameEn: 'On-site super shop & commercial area', nameBn: 'প্রকল্পের সুপার শপ ও বাণিজ্যিক এলাকা', noteEn: 'Planned within South City', noteBn: 'সাউথ সিটির ভেতরে পরিকল্পিত' },
      { nameEn: 'Local bazaars (Sayedpur / Nimtali)', nameBn: 'স্থানীয় বাজার (সায়েদপুর / নিমতলী)', noteEn: 'Walking distance', noteBn: 'হাঁটা দূরত্বে' },
      { nameEn: 'Banks & services, Keraniganj', nameBn: 'ব্যাংক ও সেবা, কেরানীগঞ্জ', noteEn: 'Within 6 km', noteBn: '৬ কিমির মধ্যে' },
    ],
  },
];

const distances = [
  { placeEn: 'Dhaka city', placeBn: 'ঢাকা শহর', valueEn: '22 km', valueBn: '২২ কিমি' },
  { placeEn: 'Dhaka–Mawa Expressway', placeBn: 'ঢাকা–মাওয়া এক্সপ্রেসওয়ে', valueEn: '1.5 km', valueBn: '১.৫ কিমি' },
  { placeEn: 'Padma Bridge', placeBn: 'পদ্মা সেতু', valueEn: '12 km', valueBn: '১২ কিমি' },
  { placeEn: 'Keraniganj', placeBn: 'কেরানীগঞ্জ', valueEn: '6 km', valueBn: '৬ কিমি' },
  { placeEn: 'Hazrat Shahjalal Airport', placeBn: 'হযরত শাহজালাল বিমানবন্দর', valueEn: '30–35 min', valueBn: '৩০–৩৫ মিনিট' },
];

const boundaries = [
  { sideEn: 'West', sideBn: 'পশ্চিমে', valueEn: 'KC Road', valueBn: 'কেসি রোড' },
  { sideEn: 'East', sideBn: 'পূর্বে', valueEn: 'Dhaleshwari River & embankment road', valueBn: 'ধলেশ্বরী নদী ও বাঁধ সড়ক' },
  { sideEn: 'North', sideBn: 'উত্তরে', valueEn: 'Sayedpur Para', valueBn: 'সায়েদপুর পাড়া' },
  { sideEn: 'South', sideBn: 'দক্ষিণে', valueEn: 'Nimtali', valueBn: 'নিমতলী' },
];

// 🔴 PLACEHOLDER: prices unconfirmed → all "Call for price" (spec §21).
const plotTypes = [
  { katha: 3, sqftEn: '2,160 sq ft', sqftBn: '২,১৬০ বর্গফুট', dimEn: '≈ 36 ft × 60 ft', dimBn: '≈ ৩৬ ফুট × ৬০ ফুট', price: null },
  { katha: 5, sqftEn: '3,600 sq ft', sqftBn: '৩,৬০০ বর্গফুট', dimEn: '≈ 50 ft × 72 ft', dimBn: '≈ ৫০ ফুট × ৭২ ফুট', price: null },
  { katha: 10, sqftEn: '7,200 sq ft', sqftBn: '৭,২০০ বর্গফুট', dimEn: '≈ 72 ft × 100 ft', dimBn: '≈ ৭২ ফুট × ১০০ ফুট', price: null },
];

const galleryCaptions = [
  { en: 'Gateway entrance render', bn: 'প্রবেশদ্বারের রেন্ডার' },
  { en: '60 ft main boulevard', bn: '৬০ ফুট প্রধান সড়ক' },
  { en: 'Central mosque render', bn: 'কেন্দ্রীয় মসজিদের রেন্ডার' },
  { en: 'Green park & trails', bn: 'সবুজ পার্ক ও ট্রেইল' },
  { en: 'Dhaleshwari riverside', bn: 'ধলেশ্বরী নদীতীর' },
  { en: 'Plot development progress', bn: 'প্লট উন্নয়নের অগ্রগতি' },
];

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@southdhaka.com.bd').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe#2026';

  // ---------------------------------------------------------- First ADMIN
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Admin',
      email: adminEmail,
      passwordHash: await hash(adminPassword),
      role: 'ADMIN',
      mustChangePassword: true,
      isActive: true,
    },
  });
  console.log(`✔ Admin ready: ${adminEmail}  (temp password: ${adminPassword})`);

  // ---------------------------------------------- A sample STAFF (RBAC test)
  await prisma.user.upsert({
    where: { email: 'staff@southdhaka.com.bd' },
    update: {},
    create: {
      name: 'Sample Staff',
      email: 'staff@southdhaka.com.bd',
      passwordHash: await hash('Staff#2026'),
      role: 'STAFF',
      mustChangePassword: true,
    },
  });
  console.log('✔ Staff ready: staff@southdhaka.com.bd (temp password: Staff#2026)');

  // ------------------------------------------------------- Company profile
  // 🔴 phone/email/address are placeholders pending owner confirmation (spec §21).
  await prisma.companyProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nameEn: 'South Dhaka Properties & Housing Ltd.',
      nameBn: 'সাউথ ঢাকা প্রপার্টিজ অ্যান্ড হাউজিং লিমিটেড',
      taglinePrimary: 'Where Your Dream Finds Its Address',
      taglineSecondary: 'Building Landmark, Creating Legacy',
      aboutEn:
        'South Dhaka Properties & Housing Ltd. is a real-estate development company dedicated to building planned, legally secure and amenity-rich townships around Dhaka. We turn well-located land into complete communities — with transparent documentation, flexible installment plans and a promise to register on full payment.',
      aboutBn:
        'সাউথ ঢাকা প্রপার্টিজ অ্যান্ড হাউজিং লিমিটেড একটি রিয়েল-এস্টেট ডেভেলপমেন্ট কোম্পানি, যা ঢাকার আশেপাশে পরিকল্পিত, আইনগতভাবে নিরাপদ ও সুবিধাসম্পন্ন টাউনশিপ গড়ে তোলায় নিবেদিত। স্বচ্ছ ডকুমেন্টেশন, সহজ কিস্তি এবং সম্পূর্ণ মূল্য পরিশোধে রেজিস্ট্রেশনের প্রতিশ্রুতি নিয়ে আমরা সুবিন্যস্ত জমিকে পূর্ণাঙ্গ কমিউনিটিতে রূপ দিই।',
      visionEn:
        'To be a trusted name in planned housing across South Dhaka — creating landmarks that families are proud to call home.',
      visionBn:
        'দক্ষিণ ঢাকায় পরিকল্পিত আবাসনের একটি বিশ্বস্ত নাম হয়ে ওঠা — এমন ল্যান্ডমার্ক গড়া যাকে পরিবার গর্বের সাথে "বাড়ি" বলে ডাকতে পারে।',
      missionEn:
        'To deliver transparent, well-planned and affordable land ownership through honest documentation, quality development and lasting customer care.',
      missionBn:
        'সৎ ডকুমেন্টেশন, মানসম্পন্ন উন্নয়ন এবং দীর্ঘস্থায়ী গ্রাহকসেবার মাধ্যমে স্বচ্ছ, সুপরিকল্পিত ও সাশ্রয়ী জমির মালিকানা নিশ্চিত করা।',
      coreValues: coreValues as unknown as Prisma.InputJsonValue,
      logoUrl: '/brand/sd-logo.svg',
      phone: '+8801862534626', // 🔴 placeholder
      email: 'info@southdhaka.com.bd', // 🔴 placeholder
      addressEn: 'Rahman Chamber, Motijheel C/A, Dhaka-1000', // 🔴 placeholder
      addressBn: 'রহমান চেম্বার, মতিঝিল বা/এ, ঢাকা-১০০০', // 🔴 placeholder
      facebook: 'https://www.facebook.com/', // 🔴 placeholder
      youtube: 'https://www.youtube.com/', // 🔴 placeholder
      linkedin: 'https://www.linkedin.com/', // 🔴 placeholder
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '8801862534626',
    },
  });
  console.log('✔ Company profile seeded');

  // ------------------------------------------------- Chairman & MD messages
  const leaders = [
    {
      role: 'CHAIRMAN',
      personName: 'Chairman', // 🔴 real name pending owner confirmation
      titleEn: 'Chairman',
      titleBn: 'চেয়ারম্যান',
      messageEn:
        'At South Dhaka Properties & Housing Ltd. we believe a home is more than land — it is security, dignity and a legacy for the next generation. Every project we undertake is a promise: transparent dealings, lawful documentation and developments that stand the test of time. I invite you to be part of our journey.',
      messageBn:
        'সাউথ ঢাকা প্রপার্টিজ অ্যান্ড হাউজিং লিমিটেডে আমরা বিশ্বাস করি, একটি বাড়ি কেবল জমি নয় — এটি নিরাপত্তা, মর্যাদা এবং পরবর্তী প্রজন্মের জন্য একটি উত্তরাধিকার। আমাদের প্রতিটি প্রকল্প একটি প্রতিশ্রুতি: স্বচ্ছ লেনদেন, বৈধ ডকুমেন্টেশন এবং সময়ের পরীক্ষায় টিকে থাকা উন্নয়ন। আমাদের এই যাত্রার অংশ হতে আপনাকে আমন্ত্রণ জানাই।',
      sortOrder: 0,
    },
    {
      role: 'MD',
      personName: 'Managing Director', // 🔴 real name pending owner confirmation
      titleEn: 'Managing Director',
      titleBn: 'ব্যবস্থাপনা পরিচালক',
      messageEn:
        'Our commitment is simple: deliver what we promise. From well-planned sectors and wide roads to schools, mosques and green spaces, South City is designed for real family life. With installment plans of up to five years, we keep quality ownership within your reach.',
      messageBn:
        'আমাদের প্রতিশ্রুতি সহজ: যা বলি, তা-ই দিই। সুপরিকল্পিত সেক্টর ও প্রশস্ত রাস্তা থেকে শুরু করে স্কুল, মসজিদ ও সবুজ পরিসর — সাউথ সিটি সাজানো হয়েছে বাস্তব পারিবারিক জীবনের কথা ভেবে। পাঁচ বছর পর্যন্ত কিস্তির সুবিধায় আমরা মানসম্পন্ন মালিকানা আপনার নাগালে রাখি।',
      sortOrder: 1,
    },
  ];
  for (const l of leaders) {
    const existing = await prisma.leaderMessage.findFirst({ where: { role: l.role } });
    if (existing) await prisma.leaderMessage.update({ where: { id: existing.id }, data: l });
    else await prisma.leaderMessage.create({ data: l });
  }
  console.log('✔ Chairman & MD messages seeded');

  // ------------------------------------------------------ South City project
  const project = await prisma.project.upsert({
    where: { slug: 'south-city' },
    update: {},
    create: {
      slug: 'south-city',
      nameEn: 'South City',
      nameBn: 'সাউথ সিটি',
      status: 'ONGOING',
      tagline: 'Where Your Dream Finds Its Address',
      logoUrl: '/brand/sd-logo.svg', // 🔴 project-specific logo can replace this
      heroImageUrl: '/projects/south-city/hero.webp',
      masterPlanUrl: '/projects/south-city/master-plan.webp',
      locationEn: 'Sayedpur, South Keraniganj, Dhaka',
      locationBn: 'সায়েদপুর, দক্ষিণ কেরানীগঞ্জ, ঢাকা',
      sizeText: '~500 Bigha',
      sectorsText: '4 (A–D)',
      plotSizesText: '3, 5 & 10 Katha',
      roadWidthText: '25/40/60 ft',
      descriptionEn:
        'South City is a ~500-bigha planned residential & commercial land development on the banks of the Dhaleshwari river in Sayedpur, South Keraniganj — minutes from the Dhaka–Mawa Expressway. Four thoughtfully laid-out sectors, 25–60 ft roads, and everyday facilities like schools, a central mosque and a health centre are growing into a complete township, while installment plans of up to 5 years keep ownership within reach.',
      descriptionBn:
        'সাউথ সিটি — দক্ষিণ কেরানীগঞ্জের সায়েদপুরে, ধলেশ্বরী নদীর তীরে প্রায় ৫০০ বিঘার একটি পরিকল্পিত আবাসিক ও বাণিজ্যিক ল্যান্ড ডেভেলপমেন্ট প্রকল্প — ঢাকা–মাওয়া এক্সপ্রেসওয়ে থেকে মাত্র কয়েক মিনিটের দূরত্বে। চারটি সুপরিকল্পিত সেক্টর, ২৫–৬০ ফুট প্রশস্ত রাস্তা, আর স্কুল, কেন্দ্রীয় মসজিদ ও হেলথ সেন্টারসহ দৈনন্দিন সব সুবিধা নিয়ে গড়ে উঠছে একটি পূর্ণাঙ্গ টাউনশিপ; সঙ্গে রয়েছে ৫ বছর পর্যন্ত সহজ কিস্তির সুবিধা।',
      amenities: amenities as unknown as Prisma.InputJsonValue,
      landmarks: landmarks as unknown as Prisma.InputJsonValue,
      distances: distances as unknown as Prisma.InputJsonValue,
      boundaries: boundaries as unknown as Prisma.InputJsonValue,
      plotTypes: plotTypes as unknown as Prisma.InputJsonValue,
      trustItems: trustItems as unknown as Prisma.InputJsonValue,
      // 🔴 map embed: replace with an exact plus-code / coordinates for a precise pin
      mapEmbedUrl:
        'https://www.google.com/maps?q=Sayedpur,+South+Keraniganj,+Dhaka&output=embed',
      brochureUrl: null, // 🔴 upload the real brochure PDF via admin → project content
      isPublished: true,
      sortOrder: 0,
    },
  });
  console.log('✔ South City project seeded');

  // Gallery images for South City
  const galleryCount = await prisma.projectImage.count({ where: { projectId: project.id } });
  if (galleryCount === 0) {
    for (let i = 0; i < galleryCaptions.length; i++) {
      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          url: `/projects/south-city/gallery-${i + 1}.webp`,
          captionEn: galleryCaptions[i].en,
          captionBn: galleryCaptions[i].bn,
          sortOrder: i,
        },
      });
    }
    console.log(`✔ ${galleryCaptions.length} gallery images seeded`);
  }

  // ---------------- Sample plot inventory: sectors A–D, sizes 3/5/10 Katha
  const sizes = [3, 5, 10];
  const sectors = ['A', 'B', 'C', 'D'];
  let created = 0;
  for (const sector of sectors) {
    for (let n = 1; n <= 8; n++) {
      const sizeKatha = sizes[(n - 1) % sizes.length];
      const category: PlotCategory = n % 4 === 0 ? 'COMMERCIAL' : 'RESIDENTIAL';
      const roadWidthFt = [25, 40, 60][(n - 1) % 3];
      const plotNumber = `${sector}-${String(n).padStart(2, '0')}`;
      await prisma.plot.upsert({
        where: { projectId_sector_plotNumber: { projectId: project.id, sector, plotNumber } },
        update: {},
        create: {
          projectId: project.id,
          sector,
          plotNumber,
          sizeKatha,
          category,
          roadWidthFt,
          dimensions: sizeKatha === 3 ? '36ft x 60ft' : sizeKatha === 5 ? '50ft x 72ft' : '72ft x 100ft',
          status: 'AVAILABLE',
          basePrice: (sizeKatha * 1_200_000).toString(), // indicative only
        },
      });
      created++;
    }
  }
  console.log(`✔ Plot inventory seeded (${created} plots across sectors A–D)`);

  console.log('\n🌱 Seed complete. Log in at /login and change the admin password.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
