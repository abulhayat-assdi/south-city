import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// For now the whole app resolves messages for a single active locale. The public
// marketing site's /en routing is wired up when that site is ported (spec §11);
// this keeps admin/portal working with Bangla defaults today.
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
