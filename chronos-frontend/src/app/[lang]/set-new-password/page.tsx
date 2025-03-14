'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useDictionary } from '@/contexts';

export default function ResetPasswordPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
    
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            setIsSubmitting(false);
            return;
        }
    
        try {
            if (!token || !newPassword) {
                console.error("Token and newPassword are required!");
                setIsSubmitting(false);
                return;
            }
            const response = await fetch('http://localhost:3001/auth/reset-password-with-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                if (data.code === "FST_ERR_VALIDATION") {
                    setError("Password must be at least 8 characters long.");
                } else {
                    setError(data.message || dict.auth.errors.generic);
                }
                setIsSubmitting(false);
                return;
            }
    
            setSuccess(true);
            setTimeout(() => router.push(`/${lang}/login`), 1500);
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsSubmitting(false);
        }
    };
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Mail className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {dict.auth.resetPassword.newPasswordTitle}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {dict.auth.resetPassword.subtitle}{' '}
                    <Link
                        href={`/${lang}/login`}
                        className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                        {dict.auth.resetPassword.loginLink}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-dark-surface py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200 rounded-md">
                            {dict.auth.resetPassword.newPasswordSuccess}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.resetPassword.newPasswordField}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting
                                ? dict.auth.resetPassword.loading
                                : dict.auth.resetPassword.submit}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

