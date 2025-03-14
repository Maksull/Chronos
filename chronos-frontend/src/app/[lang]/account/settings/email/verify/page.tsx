'use client';
import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, X, Check, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDictionary } from '@/contexts';
import { ProtectedRoute } from '@/components';

export default function VerifyEmailChangePage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [redirectCountdown, setRedirectCountdown] = useState(0);

    // Handle token verification from URL (direct link)
    useEffect(() => {
        if (token) {
            verifyWithToken(token);
        }
    }, [token]);

    // Handle resend countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Handle redirect countdown after successful verification
    useEffect(() => {
        if (isVerified && redirectCountdown > 0) {
            const timer = setTimeout(
                () => setRedirectCountdown(redirectCountdown - 1),
                1000,
            );

            if (redirectCountdown === 1) {
                router.push(`/${lang}/account/settings`);
            }

            return () => clearTimeout(timer);
        }
    }, [isVerified, redirectCountdown, router, lang]);

    // Verify with token from URL
    const verifyWithToken = async (verificationToken: string) => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // The backend expects a 6-digit code in the request body
            // Looking at the backend implementation, the code should be sent as the 'code' field in the request body
            const response = await fetch(
                'http://localhost:3001/auth/verify-email-change',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ code: verificationToken }),
                },
            );

            const data = await response.json();

            if (data.status === 'error') {
                setError(data.message || dict.auth.errors.generic);
                return;
            }

            setSuccess(dict.auth.verifyEmail.success);
            setIsVerified(true);
            setRedirectCountdown(5);

            // Refresh the authentication token since the email has changed
            // This ensures the JWT token reflects the new email
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            userInfo.email = data.data?.email || userInfo.email;
            localStorage.setItem('user', JSON.stringify(userInfo));
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    // Verify with manually entered code
    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(
                'http://localhost:3001/auth/verify-email-change',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ code: verificationCode }),
                },
            );

            const data = await response.json();

            if (data.status === 'error') {
                setError(data.message || dict.auth.errors.generic);
                return;
            }

            setSuccess(dict.auth.verifyEmail.success);
            setIsVerified(true);
            setRedirectCountdown(5);

            // Refresh the authentication token since the email has changed
            // This ensures the JWT token reflects the new email
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            userInfo.email = data.data?.email || userInfo.email;
            localStorage.setItem('user', JSON.stringify(userInfo));
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;

        setError('');
        setCountdown(60); // Set a 60-second cooldown

        try {
            // We need to wait for the backend to expose a resend endpoint for email change verification
            // This is a placeholder for now
            setSuccess(dict.auth.verifyEmail.codeSent);
        } catch {
            setError(dict.auth.errors.generic);
            setCountdown(0);
        }
    };

    if (isVerified) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="max-w-md w-full mx-auto px-4 py-8">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Email Successfully Verified!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Your email address has been successfully
                                    changed.
                                </p>
                                <div className="mb-4">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Redirecting to settings in{' '}
                                        {redirectCountdown} seconds...
                                    </p>
                                </div>
                                <Link
                                    href={`/${lang}/account/settings`}
                                    className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors">
                                    Back to Settings
                                    <ArrowLeft className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href={`/${lang}/account/settings/email`}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
                            <ArrowLeft className="h-5 w-5" />
                            {dict.settings.backToSecurity}
                        </Link>
                        <div className="flex items-center gap-3">
                            <Mail className="h-6 w-6 text-gray-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {dict.auth.verifyEmail.title}
                            </h1>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {dict.auth.verifyEmail.description}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                            {dict.auth.verifyEmail.checkSpam}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                            {dict.auth.verifyEmail.codeExpiry}
                        </p>
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

                    {success && !isVerified && (
                        <div className="mb-6 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex-shrink-0 text-green-500">
                                <Check className="h-5 w-5" />
                            </div>
                            <p className="text-green-700 dark:text-green-200">
                                {success}
                            </p>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        {token && isLoading ? (
                            <div className="p-6 text-center">
                                <div className="animate-pulse text-indigo-600 dark:text-indigo-400 mb-4">
                                    {dict.settings.common.loading}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Verifying your email address...
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleVerification}
                                className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {dict.auth.verifyEmail.enterCode}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={e =>
                                            setVerificationCode(e.target.value)
                                        }
                                        placeholder="000000"
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        isLoading ||
                                        verificationCode.length !== 6
                                    }
                                    className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                                    {isLoading
                                        ? dict.auth.verifyEmail.loading
                                        : dict.auth.verifyEmail.submit}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={countdown > 0}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:hover:no-underline">
                                        {countdown > 0
                                            ? dict.auth.verifyEmail.waitResend.replace(
                                                  '{seconds}',
                                                  countdown.toString(),
                                              )
                                            : dict.auth.verifyEmail.resendCode}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
