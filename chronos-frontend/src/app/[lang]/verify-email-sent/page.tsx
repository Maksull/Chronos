'use client';

import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { useDictionary } from '@/contexts';

export default function VerifyEmailSentPage() {
    const { dict, lang } = useDictionary();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Calendar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {dict.auth.verify.sent.title}
                </h2>
                <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-4">{dict.auth.verify.sent.description}</p>
                    <p>{dict.auth.verify.sent.checkSpam}</p>
                </div>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-dark-surface py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <Link
                            href={`/${lang}/verify-email`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                            {dict.auth.verify.sent.enterCode}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
