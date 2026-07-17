/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: '#14245C', // primary — headers, headings, buttons
        'navy-deep': '#0E1A44', // footer, dark bars, hero overlay
        gold: '#C9A227', // accent — CTAs, icons, borders, highlights
        'gold-light': '#E2C56B',
        whatsapp: '#25D366', // WhatsApp buttons only
        ink: '#1F2430', // body text
        muted: '#5B6472',
        line: '#E3E6EC',
        'bg-soft': '#F6F7FA', // alternating section background
      },
      fontFamily: {
        display: [
          'Poppins',
          'Hind Siliguri',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        body: [
          'Inter',
          'Noto Sans Bengali',
          'Hind Siliguri',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        header: '0 2px 14px rgba(20, 36, 92, 0.10)',
        card: '0 4px 24px rgba(20, 36, 92, 0.08)',
      },
    },
  },
  plugins: [],
};
