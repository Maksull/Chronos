'use client';

import { Calendar, Bell, User, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components';
import Link from 'next/link';
import { useState } from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
import { LanguageToggler } from '.';
import { useAuth } from '@/contexts';

export function Header() {
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { logout, isAuthenticated } = useAuth(); // Use authentication state from context

    const handleLogout = () => {
        logout();
    };

    const authLinks = (
        <>
            <div className="flex">
                <LanguageToggler currentLang={lang} />
                <ThemeToggle />
                {isAuthenticated ? (
                    <>
                        <button
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            aria-label={dict.navigation.notifications}>
                            <Bell className="h-6 w-6" />
                        </button>
                        <button
                            onClick={() => router.push(`/${lang}/account`)}
                            className="p-2 text-gray-500 dark:text-gray-400"
                            aria-label={dict.navigation.profile}>
                            <User className="h-6 w-6 hover:text-gray-700 dark:hover:text-white" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-x-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                            <LogOut className="h-6 w-6" />
                            <span>{dict.navigation.logout}</span>
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex gap-x-4">
                            <Link
                                href={`/${lang}/login`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 ">
                                <LogIn className="h-4 w-4 mr-2" />
                                {dict.navigation.login}
                            </Link>
                            <Link
                                href={`/${lang}/register`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 ">
                                {dict.navigation.register}
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );

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
                    </div>
                    <div className="flex items-center">
                        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                            {authLinks}
                        </div>
                        <div className="sm:hidden">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                aria-controls="mobile-menu"
                                aria-expanded={isMenuOpen}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? (
                                    <X
                                        className="block h-6 w-6"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Menu
                                        className="block h-6 w-6"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
