import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // Get locale from request, fallback to default locale
    let locale = await requestLocale;

    // Ensure that the incoming locale is valid
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // Load messages for the determined locale
    const messages = (await import(`../messages/${locale}.json`)).default;

    return {
        locale,
        messages,
        timeZone: 'Europe/Kiev',
    };
});
