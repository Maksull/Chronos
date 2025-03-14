"use client";

import { useRouter } from "next/navigation";
import { Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales } from '@/middleware';

interface LanguageTogglerProps {
    currentLang: string;
}

export function LanguageToggler({ currentLang }: LanguageTogglerProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Get the path without the language prefix
    const pathnameWithoutLang = pathname?.split('/').slice(2).join('/') || '';

    return (
        <div className="flex items-center justify-center gap-2">
            <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="flex">
                {locales.map((locale) => (
                    <button
                        key={locale} // Add a key to prevent rendering issues
                        type="button"
                        onClick={() => router.push(`/${locale}/${pathnameWithoutLang}`)}
                        className={`px-3 py-1 rounded-lg hover:bg-indigo-200 ${currentLang === locale
                                ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400  dark:hover:bg-indigo-800"
                                : "text-gray-600 dark:text-gray-400 dark:hover:bg-dark-bg"
                            }`}
                    >
                        {locale.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>

    );
}
