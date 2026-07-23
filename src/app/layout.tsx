import type { Metadata } from 'next';
import { Poppins, Inter, Hind_Siliguri } from 'next/font/google';
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
    default: 'South Dhaka Properties & Housing Ltd. — Where Your Dream Finds Its Address',
    template: '%s · South Dhaka Properties & Housing Ltd.',
  },
  description:
    'South Dhaka Properties & Housing Ltd. — planned residential & commercial land projects in Dhaka. South City, Sayedpur, South Keraniganj.',
};

// Bangla is the site default (spec §13). Each public page's <SiteShell> sets its
// own `lang` (bn at "/", en under "/en"); admin & portal use Bangla labels.
// NOTE: this layout is intentionally free of request-scoped calls (headers,
// cookies, next-intl's getLocale) so the public pages can render statically/ISR.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${poppins.variable} ${inter.variable} ${hindSiliguri.variable}`}>
      <body>{children}</body>
    </html>
  );
}
