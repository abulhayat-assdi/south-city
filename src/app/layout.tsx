import type { Metadata } from 'next';
import { Poppins, Inter, Hind_Siliguri } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bangla',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'South City — Where Your Dream Finds Its Address',
    template: '%s · South City',
  },
  description:
    'South City — planned residential & commercial plots in Sayedpur, South Keraniganj, Dhaka. A project of South Dhaka Properties & Housing Ltd.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${poppins.variable} ${inter.variable} ${hindSiliguri.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
