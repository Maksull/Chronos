'use client';

import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';

export function LanguageToggler() {
    const locale = useLocale();
    const pathname = usePathname();

    return (
        <div className="flex items-center justify-center gap-2">
            <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="flex rounded-lg border border-gray-200 dark:border-dark-border">
                <Link
                    href={pathname}
                    locale="en"
                    className={`px-3 py-1 text-sm transition-colors ${
                        locale === 'en'
                            ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg'
                    }`}>
                    EN
                </Link>
                <Link
                    href={pathname}
                    locale="uk"
                    className={`px-3 py-1 text-sm transition-colors border-l border-gray-200 dark:border-dark-border ${
                        locale === 'uk'
                            ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg'
                    }`}>
                    UK
                </Link>
            </div>
        </div>
    );
}
