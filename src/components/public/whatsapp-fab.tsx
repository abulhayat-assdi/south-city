import { MessageCircle, Phone } from 'lucide-react';
import { type Lang } from '@/lib/public-i18n';

export function waLink(whatsapp: string, text: string) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Floating WhatsApp button + sticky mobile Call/WhatsApp bar (spec §6). */
export function WhatsAppFab({ lang, whatsapp, phone }: { lang: Lang; whatsapp?: string | null; phone?: string | null }) {
  const text =
    lang === 'bn'
      ? 'আসসালামু আলাইকুম, আমি আপনাদের প্রজেক্ট সম্পর্কে জানতে আগ্রহী।'
      : "Assalamu Alaikum, I'm interested in your projects.";

  return (
    <>
      {whatsapp && (
        <a
          href={waLink(whatsapp, text)}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="fixed bottom-20 right-4 z-40 hidden size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 sm:flex"
        >
          <MessageCircle className="size-7" />
        </a>
      )}

      {/* sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-white sm:hidden">
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-navy">
            <Phone className="size-4" /> {lang === 'bn' ? 'কল' : 'Call'}
          </a>
        )}
        {whatsapp && (
          <a href={waLink(whatsapp, text)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-whatsapp py-3 text-sm font-semibold text-white">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        )}
      </div>
    </>
  );
}
