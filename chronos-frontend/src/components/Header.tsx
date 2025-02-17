'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Settings, Bell, User } from 'lucide-react';
import { ThemeToggle } from '@/components';
import Link from 'next/link';

export function Header() {
    const t = useTranslations('navigation');

    return (
        <header className="bg-white dark:bg-dark-surface shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                                {t('brand')}
                            </span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/calendar"
                                className="border-indigo-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                {t('calendar')}
                            </Link>
                            <Link
                                href="/tasks"
                                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                {t('tasks')}
                            </Link>
                            <Link
                                href="/events"
                                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                {t('events')}
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        <ThemeToggle />
                        <button
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            aria-label={t('notifications')}
                        >
                            <Bell className="h-6 w-6" />
                        </button>
                        <button
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            aria-label={t('settings')}
                        >
                            <Settings className="h-6 w-6" />
                        </button>
                        <button
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            aria-label={t('profile')}
                        >
                            <User className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}
