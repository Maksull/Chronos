import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

export const locales = ['en', 'uk'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

function getLocale(request: NextRequest): Locale {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
    const languages = new Negotiator({
        headers: negotiatorHeaders,
    }).languages();

    try {
        const locale = match(languages, locales, defaultLocale);
        if (locales.includes(locale as Locale)) {
            return locale as Locale;
        }
        return defaultLocale;
    } catch {
        return defaultLocale;
    }
}

// Define protected paths that require authentication
const protectedPaths = [
    '/account',
    '/account/settings',
    '/account/settings/email',
    '/account/settings/password',
];

function isProtectedPath(path: string): boolean {
    return protectedPaths.some(
        protectedPath =>
            path.startsWith(protectedPath) || path === protectedPath,
    );
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Handle locale redirection first
    const pathnameIsMissingLocale = locales.every(
        locale =>
            !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        request.nextUrl.pathname = `/${locale}${pathname}`;
        return NextResponse.redirect(request.nextUrl);
    }

    // Extract locale from path for use in redirects
    const pathnameWithoutLocale = pathname.replace(/^\/[^\/]+/, '');
    const currentLocale = pathname.split('/')[1] as Locale;

    // Check if the path is protected and requires authentication
    if (isProtectedPath(pathnameWithoutLocale)) {
        // Get the token from cookies
        const token = request.cookies.get('token')?.value || '';

        // If no token, redirect to login page
        if (!token) {
            const redirectUrl = new URL(`/${currentLocale}/login`, request.url);
            // Add return URL as a query parameter
            redirectUrl.searchParams.set('returnUrl', pathname);
            return NextResponse.redirect(redirectUrl);
        }
    }

    return NextResponse.next();
}

export const matcher = [
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
];
