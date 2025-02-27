'use client';

import { Calendar, Settings, Bell, User, LogIn } from 'lucide-react';
import { ThemeToggle } from '@/components';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/contexts/DictionaryContext';

export function Header() {
    const { dict, lang } = useDictionary();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const authLinks = isAuthenticated ? (
        <>
            <ThemeToggle />
            <button
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label={dict.navigation.notifications}>
                <Bell className="h-6 w-6" />
            </button>
            <Link
                href={`/${lang}/settings`}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label={dict.navigation.settings}>
                <Settings className="h-6 w-6" />
            </Link>
            <Link
                href={`/${lang}/account`}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label={dict.navigation.profile}>
                <User className="h-6 w-6" />
            </Link>
        </>
    ) : (
        <>
            <ThemeToggle />
            <Link
                href={`/${lang}/login`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <LogIn className="h-4 w-4 mr-2" />
                {dict.navigation.login}
            </Link>
            <Link
                href={`/${lang}/register`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {dict.navigation.register}
            </Link>
        </>
    );

    const navLinks = isAuthenticated ? (
        <>
            <Link
                href={`/${lang}/calendar`}
                className={`${
                    pathname?.includes('/calendar')
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                {dict.navigation.calendar}
            </Link>
            <Link
                href={`/${lang}/tasks`}
                className={`${
                    pathname?.includes('/tasks')
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                {dict.navigation.tasks}
            </Link>
            <Link
                href={`/${lang}/events`}
                className={`${
                    pathname?.includes('/events')
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                {dict.navigation.events}
            </Link>
        </>
    ) : null;

    return (
        <header className="bg-white dark:bg-dark-surface shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            href={`/${lang}`}
                            className="flex-shrink-0 flex items-center">
                            <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                                {dict.navigation.brand}
                            </span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navLinks}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        {authLinks}
                    </div>
                </div>
            </nav>
        </header>
    );
}
