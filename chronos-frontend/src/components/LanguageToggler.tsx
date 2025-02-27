'use client';

import { Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales } from '@/middleware';

interface LanguageTogglerProps {
    currentLang: string;
}

export function LanguageToggler({ currentLang }: LanguageTogglerProps) {
    const pathname = usePathname();

    // Get the path without the language prefix
    const pathnameWithoutLang = pathname?.split('/').slice(2).join('/') || '';

    return (
        <div className="flex items-center justify-center gap-2">
            <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="flex rounded-lg border border-gray-200 dark:border-dark-border">
                {locales.map((locale, index) => (
                    <Link
                        key={locale}
                        href={`/${locale}/${pathnameWithoutLang}`}
                        className={`px-3 py-1 text-sm transition-colors ${
                            index > 0
                                ? 'border-l border-gray-200 dark:border-dark-border'
                                : ''
                        } ${
                            currentLang === locale
                                ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg'
                        }`}>
                        {locale.toUpperCase()}
                    </Link>
                ))}
            </div>
        </div>
    );
}
