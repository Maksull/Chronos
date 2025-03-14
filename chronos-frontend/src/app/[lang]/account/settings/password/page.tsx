'use client';
import { useState } from 'react';
import { Lock, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useDictionary } from '@/contexts';
import { ProtectedRoute } from '@/components';

export default function ChangePasswordPage() {
    const { dict, lang } = useDictionary();
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(
                'http://localhost:3001/auth/change-password',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(changePasswordData),
                },
            );

            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.settings.errors.generic);
                return;
            }

            setSuccess(dict.settings.password.changeSuccess);
            setChangePasswordData({ currentPassword: '', newPassword: '' });
        } catch {
            setError(dict.settings.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

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
                            <Lock className="h-6 w-6 text-gray-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {dict.settings.password.title}
                            </h1>
                        </div>
                    </div>

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
                        <form
                            onSubmit={handlePasswordChange}
                            className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.settings.fields.currentPassword}
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={changePasswordData.currentPassword}
                                    onChange={e =>
                                        setChangePasswordData(prev => ({
                                            ...prev,
                                            currentPassword: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.settings.fields.newPassword}
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={changePasswordData.newPassword}
                                    onChange={e =>
                                        setChangePasswordData(prev => ({
                                            ...prev,
                                            newPassword: e.target.value,
                                        }))
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
                                    : dict.settings.password.change}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
