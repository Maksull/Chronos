'use client';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useDictionary } from '@/contexts';
import { ProtectedRoute } from '@/components';

export default function SecuritySettingsPage() {
    const { dict, lang } = useDictionary();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-4">
                        <Link
                            href={`/${lang}/account`}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                            {dict.settings.backToAccount}
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {dict.settings.title}
                        </h1>
                    </div>

                    <div className="grid gap-6">
                        <Link
                            href={`/${lang}/account/settings/email`}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {dict.settings.changeEmail}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {dict.settings.changeEmailDesc}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={`/${lang}/account/settings/password`}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg">
                                    <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {dict.settings.changePassword}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {dict.settings.changePasswordDesc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
