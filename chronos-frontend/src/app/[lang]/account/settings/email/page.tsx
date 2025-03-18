'use client';
import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/contexts';
import { ProtectedRoute } from '@/components';

interface UserData {
    email: string;
    isEmailVerified: boolean;
    newEmail?: string | null;
    emailChangeCodeExpiresAt?: string | null;
}

export default function ChangeEmailPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [changeEmailData, setChangeEmailData] = useState({
        password: '',
        newEmail: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsDataLoading(true);
            try {
                const response = await fetch(
                    'http://localhost:3001/users/profile',
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    },
                );

                const data = await response.json();
                if (data.status === 'success') {
                    setUserData(data.data);
                } else {
                    setError(dict.settings.errors.generic);
                }
            } catch {
                setError(dict.settings.errors.generic);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchUserData();
    }, [dict.settings.errors.generic]);

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(
                'http://localhost:3001/auth/change-email',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(changeEmailData),
                },
            );

            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.settings.errors.generic);
                return;
            }

            setSuccess(dict.settings.email.verificationSent);
            setChangeEmailData({ password: '', newEmail: '' });

            // Redirect to verification page after a brief delay to show success message
            setTimeout(() => {
                router.push(`/${lang}/account/settings/email/verify`);
            }, 2000);
        } catch {
            setError(dict.settings.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const isEmailChangeInProgress =
        userData?.newEmail && userData?.emailChangeCodeExpiresAt;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href={`/${lang}/account/settings`}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
                            <ArrowLeft className="h-5 w-5" />
                            {dict.settings.backToSecurity}
                        </Link>
                        <div className="flex items-center gap-3">
                            <Mail className="h-6 w-6 text-gray-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {dict.settings.email.title}
                            </h1>
                        </div>
                    </div>

                    {isDataLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-pulse text-indigo-600 dark:text-indigo-400">
                                {dict.settings.common.loading}
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                                    <div className="flex-shrink-0 text-red-500">
                                        <X className="h-5 w-5" />
                                    </div>
                                    <p className="text-red-700 dark:text-red-200">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded">
                                    <p className="text-green-700 dark:text-green-200">
                                        {success}
                                    </p>
                                </div>
                            )}

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                                {/* Current email info */}
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        {dict.settings.currentEmail}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        {userData?.email}
                                        {userData?.isEmailVerified && (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                </div>

                                {isEmailChangeInProgress ? (
                                    <div className="p-6">
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded">
                                            <p className="text-amber-700 dark:text-amber-300 mb-2">
                                                Email change to{' '}
                                                <span className="font-medium">
                                                    {userData.newEmail}
                                                </span>{' '}
                                                in progress.
                                            </p>
                                            <p className="text-amber-700 dark:text-amber-300 mb-4">
                                                Please check your new email
                                                address for the 6-digit
                                                verification code.
                                            </p>
                                            <Link
                                                href={`/${lang}/account/settings/email/verify`}
                                                className="text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                                                Enter verification code
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={handleEmailChange}
                                        className="p-6 space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {dict.settings.fields.newEmail}
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={changeEmailData.newEmail}
                                                onChange={e =>
                                                    setChangeEmailData(
                                                        prev => ({
                                                            ...prev,
                                                            newEmail:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {
                                                    dict.settings.fields
                                                        .currentPassword
                                                }
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={changeEmailData.password}
                                                onChange={e =>
                                                    setChangeEmailData(
                                                        prev => ({
                                                            ...prev,
                                                            password:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                                            {isLoading
                                                ? dict.account.common.loading
                                                : dict.settings.email.change}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
