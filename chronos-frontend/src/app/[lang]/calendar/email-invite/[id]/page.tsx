'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDictionary } from '@/contexts';
import { Calendar, Check, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components';

export default function CalendarEmailInvitePage() {
    const params = useParams();
    const { dict, lang } = useDictionary();

    const token = params.id as string;

    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [calendarInfo, setCalendarInfo] = useState<{
        id: string;
        name: string;
        email: string;
    } | null>(null);

    useEffect(() => {
        const fetchInviteDetails = async () => {
            try {
                const savedToken = localStorage.getItem('token');

                const response = await fetch(
                    `http://localhost:3001/calendar-email-invites/${token}`,
                    {
                        headers: {
                            Authorization: `Bearer ${savedToken || ''}`,
                        },
                    },
                );

                const data = await response.json();

                if (data.status === 'success') {
                    setCalendarInfo(data.data);
                } else {
                    setError(
                        data.message ||
                            dict.calendar?.inviteNotFound ||
                            'Invite not found or invalid',
                    );
                }
            } catch (error) {
                console.error('Error fetching invite details:', error);
                setError(
                    dict.account?.errors?.generic ||
                        'An error occurred. The invite may be invalid or expired.',
                );
            } finally {
                setLoading(false);
            }
        };

        // Make sure we're on the client side and have a token
        if (typeof window !== 'undefined' && token) {
            fetchInviteDetails();
        } else {
            if (!token) {
                setError('No invitation token provided');
                setLoading(false);
            }
        }
    }, [token, dict]);

    const handleAcceptInvite = async () => {
        setAccepting(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:3001/calendar-email-invites/${token}/accept`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess(true);
                setCalendarInfo(data.data);
            } else {
                setError(
                    data.message ||
                        dict.calendar?.inviteAcceptError ||
                        'Failed to accept invitation',
                );
            }
        } catch (error) {
            console.error('Error accepting invite:', error);
            setError(
                dict.account?.errors?.generic ||
                    'An error occurred while accepting the invitation.',
            );
        } finally {
            setAccepting(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-lg mx-auto px-4 sm:px-6">
                    <div className="mb-6">
                        <Link
                            href={`/${lang}/account`}
                            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {dict.calendar?.backToAccount || 'Back to Account'}
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {dict.account?.common?.loading ||
                                            'Loading...'}
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-6">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {dict.calendar?.inviteError ||
                                            'Invitation Error'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {error}
                                    </p>
                                    <Link
                                        href={`/${lang}/account`}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        {dict.calendar?.returnToAccount ||
                                            'Return to Account'}
                                    </Link>
                                </div>
                            ) : success ? (
                                <div className="text-center py-6">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {dict.calendar?.inviteAccepted ||
                                            'Invitation Accepted!'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {dict.calendar?.inviteAcceptedDesc ||
                                            `You've been added to "${calendarInfo?.name}" calendar successfully.`}
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                                        <Link
                                            href={`/${lang}/calendar/${calendarInfo?.id}`}
                                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            {dict.calendar?.viewCalendar ||
                                                'View Calendar'}
                                        </Link>
                                        <Link
                                            href={`/${lang}/account`}
                                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            {dict.calendar?.goToAccount ||
                                                'Go to Account'}
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                                        <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {dict.calendar?.calendarInvitation ||
                                            'Calendar Invitation'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {calendarInfo?.name
                                            ? dict.calendar?.emailInvitePromptWithName
                                                  ?.replace(
                                                      '{calendarName}',
                                                      calendarInfo.name,
                                                  )
                                                  .replace(
                                                      '{email}',
                                                      calendarInfo.email,
                                                  ) ||
                                              `You've been invited to join "${calendarInfo.name}" calendar with your email (${calendarInfo.email}).`
                                            : dict.calendar
                                                  ?.emailInvitePrompt ||
                                              "You've been invited to join a calendar."}
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                                        <button
                                            onClick={handleAcceptInvite}
                                            disabled={accepting}
                                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed">
                                            {accepting ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24">
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {dict.calendar?.accepting ||
                                                        'Accepting...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    {dict.calendar
                                                        ?.acceptInvite ||
                                                        'Accept Invitation'}
                                                </>
                                            )}
                                        </button>
                                        <Link
                                            href={`/${lang}/account`}
                                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <X className="mr-2 h-4 w-4" />
                                            {dict.calendar?.declineInvite ||
                                                'Decline'}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
