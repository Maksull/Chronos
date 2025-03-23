'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { AuthResponse, LoginFormData } from '@/types/auth';
import { useAuth, useDictionary } from '@/contexts';
import { useError } from '@/contexts/ErrorContext';
import { useApi } from '@/lib/useApi';

export default function LoginPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated, isLoading } = useAuth();
    const { setError } = useError();
    const api = useApi();

    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });
    const [pageError, setPageError] = useState<string>(''); // For inline page display
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            const returnUrl = searchParams.get('returnUrl');
            if (returnUrl && returnUrl.startsWith(`/${lang}/`)) {
                router.push(returnUrl);
            } else {
                router.push(`/${lang}/account`);
            }
        }
    }, [isAuthenticated, isLoading, router, lang, searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPageError('');
        setIsSubmitting(true);

        // Fallback error message
        const genericErrorMessage =
            dict?.auth?.errors?.generic || 'Login failed. Please try again.';

        try {
            // Always show errors automatically
            const response = await api.post<AuthResponse>(
                '/auth/login',
                formData,
                true, // Always show error modal
            );

            if (response.status === 'error') {
                // Also set the page error for better accessibility
                const errorMessage = response.message || genericErrorMessage;
                setPageError(errorMessage);
                return;
            }

            if (response.data?.data?.token && response.data?.data.user) {
                login(response.data.data.token, response.data.data.user);
                document.cookie = `token=${response.data.data.token}; path=/; max-age=86400; SameSite=Strict;`;
            } else {
                // Handle the case where we got a success response but incorrect data
                setPageError(genericErrorMessage);
                setError(genericErrorMessage);
            }
        } catch (err) {
            // Log the error for debugging
            console.error('Login error:', err);

            // Show a generic error message
            setPageError(genericErrorMessage);
            setError(genericErrorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Calendar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {dict.auth.login.title}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {dict.auth.login.subtitle}{' '}
                    <Link
                        href={`/${lang}/register`}
                        className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                        {dict.auth.login.registerLink}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-dark-surface py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Inline error display for accessibility */}
                    {pageError && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                            {pageError}
                        </div>
                    )}

                    {searchParams.get('returnUrl') && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 rounded-md text-sm">
                            {dict.auth.login.pleaseLoginToContinue}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.fields.username}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.fields.password}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link
                                    href={`/${lang}/reset-password`}
                                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                                    {dict.auth.login.forgotPassword}
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting
                                ? dict.auth.login.loading
                                : dict.auth.login.submit}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
