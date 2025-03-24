import {
    Calendar,
    Clock,
    Users,
    Target,
    Lock,
    Globe,
    ArrowRight,
    Star,
} from 'lucide-react';
import { getDictionary } from '@/lib/dictionary';
import { Locale } from '@/middleware';
import Link from 'next/link';

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
            icon: <Calendar className="w-6 h-6 text-white" />,
        },
        {
            title: dict.home.features.items.categories.title,
            description: dict.home.features.items.categories.description,
            icon: <Target className="w-6 h-6 text-white" />,
        },
        {
            title: dict.home.features.items.collaboration.title,
            description: dict.home.features.items.collaboration.description,
            icon: <Users className="w-6 h-6 text-white" />,
        },
        {
            title: dict.home.features.items.holidays.title,
            description: dict.home.features.items.holidays.description,
            icon: <Globe className="w-6 h-6 text-white" />,
        },
        {
            title: dict.home.features.items.quickEvents.title,
            description: dict.home.features.items.quickEvents.description,
            icon: <Clock className="w-6 h-6 text-white" />,
        },
        {
            title: dict.home.features.items.privacy.title,
            description: dict.home.features.items.privacy.description,
            icon: <Lock className="w-6 h-6 text-white" />,
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                {/* Decorative elements */}
                <div className="hidden lg:block absolute top-0 right-0 -mt-24 -mr-24">
                    <div className="text-indigo-100 dark:text-indigo-900/20 transform rotate-45">
                        <svg
                            width="400"
                            height="400"
                            viewBox="0 0 600 600"
                            xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(300,300)">
                                <path
                                    d="M153.6,-196.4C193.7,-161.3,217.9,-109.1,228.2,-54.7C238.6,-0.3,235,56.2,210.3,98.9C185.5,141.5,139.6,170.2,90,193.3C40.3,216.4,-13.1,233.9,-70.1,228.3C-127.1,222.8,-187.7,194.2,-215.8,147.5C-243.9,100.8,-239.6,36,-221.9,-19.8C-204.2,-75.7,-173.2,-122.7,-133.4,-157.8C-93.5,-192.9,-46.8,-216.2,4.7,-222.1C56.1,-228.1,113.4,-231.5,153.6,-196.4Z"
                                    fill="currentColor"
                                />
                            </g>
                        </svg>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="relative z-10 pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                            <div className="lg:col-span-6">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">
                                        {dict.home.hero.title.first}
                                    </span>
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 xl:inline">
                                        {' '}
                                        {dict.home.hero.title.second}
                                    </span>
                                </h1>
                                <p className="mt-6 text-xl text-gray-500 dark:text-gray-300 max-w-3xl">
                                    {dict.home.hero.description}
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={`/${lang}/register`}
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200">
                                        {dict.navigation?.register ||
                                            'Get Started'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={`/${lang}/login`}
                                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                                        {dict.navigation?.login || 'Sign In'}
                                    </Link>
                                </div>

                                <div className="mt-6 flex items-center">
                                    <div className="flex -space-x-2">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 ${
                                                    [
                                                        'bg-indigo-400',
                                                        'bg-purple-400',
                                                        'bg-pink-400',
                                                        'bg-blue-400',
                                                    ][i]
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            100+{' '}
                                        </span>
                                        {dict.home.hero?.users ||
                                            'users already joined'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 lg:mt-0 lg:col-span-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-300">
                                    <div className="px-1 py-1 sm:p-2">
                                        <div className="flex items-center gap-2 px-3 py-2">
                                            <div className="flex space-x-1">
                                                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                                                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                                                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                            </div>
                                            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
                                        </div>
                                        <div className="p-4 pt-2">
                                            <div className="calendar-mockup bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="font-bold text-indigo-600 dark:text-indigo-400">
                                                        March 2025
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-800/40 rounded flex items-center justify-center">
                                                            <ArrowRight className="h-3 w-3 text-indigo-600 dark:text-indigo-400 transform -rotate-180" />
                                                        </div>
                                                        <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-800/40 rounded flex items-center justify-center">
                                                            <ArrowRight className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 mb-2">
                                                    {[
                                                        'S',
                                                        'M',
                                                        'T',
                                                        'W',
                                                        'T',
                                                        'F',
                                                        'S',
                                                    ].map((day, i) => (
                                                        <div
                                                            key={i}
                                                            className="text-xs text-center text-gray-500 dark:text-gray-400">
                                                            {day}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">
                                                    {Array.from(
                                                        { length: 31 },
                                                        (_, i) => i + 1,
                                                    ).map(day => {
                                                        const hasEvent = [
                                                            3, 10, 15, 22, 27,
                                                        ].includes(day);
                                                        const isToday =
                                                            day === 23;

                                                        return (
                                                            <div
                                                                key={day}
                                                                className={`text-xs h-8 flex items-center justify-center rounded-full relative
                                  ${isToday ? 'bg-indigo-600 text-white' : ''}
                                  ${hasEvent && !isToday ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {day}
                                                                {hasEvent && (
                                                                    <div
                                                                        className={`absolute bottom-1 h-1 w-1 rounded-full ${isToday ? 'bg-white' : 'bg-indigo-500 dark:bg-indigo-400'}`}></div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="mt-4 space-y-2">
                                                    <div className="h-8 bg-white dark:bg-gray-600 rounded p-2 flex items-center">
                                                        <div className="h-4 w-4 rounded-full bg-purple-500 mr-2"></div>
                                                        <div className="h-2 w-32 bg-gray-200 dark:bg-gray-500 rounded"></div>
                                                    </div>
                                                    <div className="h-8 bg-white dark:bg-gray-600 rounded p-2 flex items-center">
                                                        <div className="h-4 w-4 rounded-full bg-indigo-500 mr-2"></div>
                                                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-500 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <p className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">
                            {dict.home.features.title}
                        </p>
                        <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            {dict.home.features.subtitle}
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                            {dict.home.features.description}
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className={`rounded-lg p-3 ${
                                                [
                                                    'bg-gradient-to-br from-indigo-600 to-purple-600',
                                                    'bg-gradient-to-br from-blue-600 to-indigo-600',
                                                    'bg-gradient-to-br from-purple-600 to-pink-600',
                                                    'bg-gradient-to-br from-green-500 to-teal-500',
                                                    'bg-gradient-to-br from-amber-500 to-orange-600',
                                                    'bg-gradient-to-br from-pink-500 to-rose-500',
                                                ][index]
                                            } group-hover:shadow-lg transition-all duration-300`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">
                            {dict.home.cta?.ready || 'Ready to dive in?'}
                        </span>
                        <span className="block text-indigo-200">
                            {dict.home.cta?.start ||
                                'Start organizing your time today.'}
                        </span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 gap-4">
                        <Link
                            href={`/${lang}/register`}
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all duration-200">
                            {dict.navigation?.register || 'Get Started'}
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent border-white text-base font-medium rounded-lg text-white hover:bg-white/10 transition-all duration-200">
                            {dict.home.cta?.learn || 'Learn more'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative">
                        <div className="text-center">
                            <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                                {dict.home.testimonials?.title ||
                                    'Trusted by organizers worldwide'}
                            </h2>
                            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
                                {dict.home.testimonials?.subtitle ||
                                    "Here's what our users are saying about Chronos"}
                            </p>
                        </div>

                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col">
                                    <div className="flex items-center mb-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                className="h-5 w-5 text-yellow-400 fill-current"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                                        Chronos has completely transformed how I
                                        manage my time. The intuitive interface
                                        and powerful features make it easy to
                                        stay organized.
                                    </p>
                                    <div className="flex items-center">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                [
                                                    'bg-indigo-500',
                                                    'bg-purple-500',
                                                    'bg-pink-500',
                                                ][i - 1]
                                            }`}>
                                            {['JD', 'MT', 'SR'][i - 1]}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {
                                                    [
                                                        'John Doe',
                                                        'Maria Thompson',
                                                        'Sam Rodriguez',
                                                    ][i - 1]
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {
                                                    [
                                                        'Project Manager',
                                                        'Event Coordinator',
                                                        'Team Lead',
                                                    ][i - 1]
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
