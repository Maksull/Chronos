import { defaultLocale, locales } from '@/config';
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales,
    defaultLocale,
});

export const config = {
    matcher: ['/', '/(uk|en)/:path*'],
};
