'use client';

import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';
import { LanguageToggler } from '.';

export function Footer() {
    const t = useTranslations('footer');

    return (
        <footer className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-surface dark:to-dark-bg w-full">
            <div className="w-full">
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xl font-semibold text-gray-900 dark:text-white">
                                {t('brand')}
                            </span>
                        </div>
                        <div className="bg-white dark:bg-dark-bg rounded-xl shadow-sm p-6 mb-8 w-full">
                            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                                {t('description')}
                            </p>
                        </div>
                        <LanguageToggler />
                    </div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-dark-border">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                        <p className="text-sm text-center text-gray-400 dark:text-gray-500">
                            {t('copyright', { year: new Date().getFullYear() })}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
