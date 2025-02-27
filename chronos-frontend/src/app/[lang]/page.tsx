// app/[lang]/page.tsx
import { Calendar, Clock, Users, Target, Lock, Globe } from 'lucide-react';
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import { Locale } from '@/middleware';

interface Feature {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default async function Home({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    const features: Feature[] = [
        {
            title: dict.home.features.items.calendarViews.title,
            description: dict.home.features.items.calendarViews.description,
            icon: (
                <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ),
        },
        {
            title: dict.home.features.items.categories.title,
            description: dict.home.features.items.categories.description,
            icon: (
                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ),
        },
        {
            title: dict.home.features.items.collaboration.title,
            description: dict.home.features.items.collaboration.description,
            icon: (
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ),
        },
        {
            title: dict.home.features.items.holidays.title,
            description: dict.home.features.items.holidays.description,
            icon: (
                <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ),
        },
        {
            title: dict.home.features.items.quickEvents.title,
            description: dict.home.features.items.quickEvents.description,
            icon: (
                <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ),
        },
        {
            title: dict.home.features.items.privacy.title,
            description: dict.home.features.items.privacy.description,
            icon: (
                <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ),
        },
    ];

    return (
        <>
            <div className="relative bg-white dark:bg-dark-surface overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white dark:bg-dark-surface sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">
                                        {dict.home.hero.title.first}
                                    </span>
                                    <span className="block text-indigo-600 dark:text-indigo-400 xl:inline">
                                        {' '}
                                        {dict.home.hero.title.second}
                                    </span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    {dict.home.hero.description}
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            href={`/${lang}/signup`}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 md:py-4 md:text-lg md:px-10">
                                            {dict.home.hero.buttons.getStarted}
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            href={`/${lang}/demo`}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 md:py-4 md:text-lg md:px-10">
                                            {dict.home.hero.buttons.liveDemo}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            <div className="py-12 bg-white dark:bg-dark-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">
                            {dict.home.features.title}
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            {dict.home.features.subtitle}
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                            {dict.home.features.description}
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            {features.map((feature, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 dark:bg-indigo-900">
                                        {feature.icon}
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                        {feature.title}
                                    </p>
                                    <p className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-700 dark:bg-indigo-900">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">
                            {dict.home.cta.title.first}
                        </span>
                        <span className="block">
                            {dict.home.cta.title.second}
                        </span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-indigo-200">
                        {dict.home.cta.description}
                    </p>
                    <Link
                        href={`/${lang}/signup`}
                        className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 dark:text-indigo-300 bg-white hover:bg-indigo-50 dark:bg-indigo-800 dark:hover:bg-indigo-700 sm:w-auto">
                        {dict.home.cta.button}
                    </Link>
                </div>
            </div>
        </>
    );
}
