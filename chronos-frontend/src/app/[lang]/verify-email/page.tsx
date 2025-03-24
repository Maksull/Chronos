'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { useDictionary } from '@/contexts';

export default function VerifyEmailPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
        // Get the email from localStorage
        const storedEmail = localStorage.getItem('verificationEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(
                () => setResendTimer(prev => prev - 1),
                1000,
            );
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleResendCode = async () => {
        if (!email) {
            setError(
                dict.auth.errors.emailRequired ||
                    'Email is required to resend the verification code',
            );
            return;
        }

        setIsResending(true);
        setError('');
        setResendSuccess(false);

        try {
            const response = await fetch(
                'http://localhost:3001/auth/resend-verification-code',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                },
            );

            const data = await response.json();

            if (data.status === 'error') {
                setError(data.message || dict.auth.errors.generic);
                return;
            }

            setResendSuccess(true);
            setResendTimer(60); // 60-second cooldown
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setResendSuccess(false);

        const verificationCode = code.join('');

        try {
            const response = await fetch(
                'http://localhost:3001/auth/verify-email',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: verificationCode }),
                },
            );

            const data = await response.json();

            if (data.status === 'error') {
                setError(data.message || dict.auth.errors.generic);
                return;
            }

            // Clear the stored email as it's no longer needed
            localStorage.removeItem('verificationEmail');
            setTimeout(() => router.push(`/${lang}/login`), 1500);
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            const newValue = value.slice(0, 1);
            const newCode = [...code];
            newCode[index] = newValue;
            setCode(newCode);
            if (index < 5) {
                inputRefs[index + 1].current?.focus();
            }
        } else {
            if (!/^\d*$/.test(value)) {
                return;
            }
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                inputRefs[index + 1].current?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text/plain');
        const digits = pastedText.replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];

        digits.split('').forEach((digit, index) => {
            if (index < 6) {
                newCode[index] = digit;
            }
        });

        setCode(newCode);
        if (digits.length > 0 && digits.length < 6) {
            inputRefs[digits.length].current?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Calendar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {dict.auth.verifyEmail.title || 'Verify your email'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {dict.auth.verifyEmail.description ||
                        'Please enter the code sent to your email address'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-dark-surface py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {resendSuccess && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-md">
                            {dict.auth.verifyEmail.resendSuccess ||
                                'Verification code has been resent to your email.'}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
                                {dict.auth.verifyEmail.enterCode ||
                                    'Enter 6-digit code'}
                            </label>
                            <div className="flex justify-center space-x-2">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e =>
                                            handleCodeChange(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        onPaste={handlePaste}
                                        onKeyDown={e => handleKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-2xl border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-bg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50"
                                    />
                                ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                {dict.auth.verifyEmail.codeExpiry ||
                                    'Code expires in 15 minutes'}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.some(digit => !digit)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading
                                ? dict.auth.verifyEmail.loading ||
                                  'Verifying...'
                                : dict.auth.verifyEmail.submit || 'Verify'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isResending || resendTimer > 0}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isResending
                                    ? dict.auth.verifyEmail.resending ||
                                      'Resending...'
                                    : resendTimer > 0
                                      ? (
                                            dict.auth.verifyEmail.waitResend ||
                                            'Resend code in {seconds}s'
                                        ).replace(
                                            '{seconds}',
                                            resendTimer.toString(),
                                        )
                                      : dict.auth.verifyEmail.resendCode ||
                                        'Resend code'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href={`/${lang}/login`}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500">
                                {dict.auth.verifyEmail.backToLogin ||
                                    'Back to login'}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
