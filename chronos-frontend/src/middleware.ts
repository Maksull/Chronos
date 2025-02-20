import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';

export default createMiddleware(routing);

export const config = {
    matcher: ['/', '/(uk|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
