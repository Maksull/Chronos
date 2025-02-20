import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
    locales,
    defaultLocale: 'en',
    localePrefix: 'as-needed',
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
