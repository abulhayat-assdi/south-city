import { PrismaClient, type PlotCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 12);
}

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@southcity.com.bd').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe#2026';

  // --- First ADMIN (spec §18.2 / §15.5) ---
  const admin = await prisma.user.upsert({
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

  // --- A sample STAFF account for testing RBAC ---
  await prisma.user.upsert({
    where: { email: 'staff@southcity.com.bd' },
    update: {},
    create: {
      name: 'Sample Staff',
      email: 'staff@southcity.com.bd',
      passwordHash: await hash('Staff#2026'),
      role: 'STAFF',
      mustChangePassword: true,
    },
  });
  console.log('✔ Staff ready: staff@southcity.com.bd (temp password: Staff#2026)');

  // --- Sample plot inventory across sectors A–D, sizes 3/5/10 Katha ---
  const sizes = [3, 5, 10];
  const sectors = ['A', 'B', 'C', 'D'];
  let created = 0;
  for (const sector of sectors) {
    for (let n = 1; n <= 8; n++) {
      const sizeKatha = sizes[(n - 1) % sizes.length];
      const category: PlotCategory = n % 4 === 0 ? 'COMMERCIAL' : 'RESIDENTIAL';
      const roadWidthFt = [25, 40, 60][(n - 1) % 3];
      const plotNumber = `${sector}-${String(n).padStart(2, '0')}`;
      const res = await prisma.plot.upsert({
        where: { sector_plotNumber: { sector, plotNumber } },
        update: {},
        create: {
          sector,
          plotNumber,
          sizeKatha,
          category,
          roadWidthFt,
          dimensions: sizeKatha === 3 ? '30ft x 72ft' : sizeKatha === 5 ? '40ft x 90ft' : '50ft x 144ft',
          status: 'AVAILABLE',
          basePrice: (sizeKatha * 1_200_000).toString(), // indicative only
        },
      });
      if (res) created++;
    }
  }
  console.log(`✔ Plot inventory seeded (${created} plots across sectors A–D)`);

  // --- A few default public-site content settings (editable from admin, §6.7) ---
  const settings: { key: string; valueBn: string; valueEn: string }[] = [
    { key: 'hero.headline', valueBn: 'যেখানে আপনার স্বপ্ন খুঁজে পায় ঠিকানা', valueEn: 'Where Your Dream Finds Its Address' },
    { key: 'contact.phone', valueBn: '০১৮৬২-৫৩৪৬২৬', valueEn: '01862-534626' },
    { key: 'contact.email', valueBn: 'contact.southcity2020@gmail.com', valueEn: 'contact.southcity2020@gmail.com' },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log('✔ Default site settings seeded');

  console.log('\n🌱 Seed complete. Log in at /login and change the admin password.');
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
