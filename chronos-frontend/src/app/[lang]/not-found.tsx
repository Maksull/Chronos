// app/[lang]/not-found.tsx
import Link from 'next/link';
import { defaultLocale, Locale } from '@/middleware';
import { getDictionary } from '@/lib/dictionary';
import { headers } from 'next/headers';

export default async function LangNotFound() {
    // Try to extract language from headers
    const headersList = await headers();
    const url = headersList.get('x-url') || headersList.get('referer') || '';

    let lang = defaultLocale;

    // Only try to extract language from URL if we have a valid URL
    if (url) {
        try {
            // Try to safely parse the URL
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split('/').filter(Boolean);
            // Check if the first segment could be a valid locale
            if (pathSegments.length > 0) {
                lang = (pathSegments[0] as Locale) || defaultLocale;
            }
        } catch (error) {
            // If URL parsing fails, fallback to default locale
            console.error('Failed to parse URL:', error);
        }
    }

    // Get dictionary for the language
    const dict = await getDictionary(lang);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {dict.NotFound.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                {dict.NotFound.description}
            </p>
            <Link
                href={`/${lang}`}
                className="mt-4 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                {dict.NotFound.backHome}
            </Link>
        </div>
    );
}
