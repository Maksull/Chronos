'use client';
import React, { useState, useEffect } from 'react';
import { Mail, AlertTriangle, Trash2, User, RefreshCw } from 'lucide-react';
import { Dictionary } from '@/lib/dictionary';
import { format, isAfter } from 'date-fns';
import { ParticipantRole } from '@/types/account';

interface EmailInvite {
    id: string;
    calendarId: string;
    email: string;
    role: ParticipantRole;
    expiresAt: string | null;
    createdAt: string;
}

interface CalendarEmailInviteManagementProps {
    calendarId: string;
    dict: Dictionary;
    readOnly?: boolean;
}

export const CalendarEmailInviteManagement: React.FC<
    CalendarEmailInviteManagementProps
> = ({ calendarId, dict, readOnly = false }) => {
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [emailInvites, setEmailInvites] = useState<EmailInvite[]>([]);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<ParticipantRole>(ParticipantRole.READER);
    const [expireInDays, setExpireInDays] = useState<number | undefined>(
        undefined,
    );
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchEmailInvites();
    }, [calendarId]);

    const fetchEmailInvites = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/email-invites`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            const data = await response.json();
            if (data.status === 'success') {
                setEmailInvites(data.data);
                setError('');
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Failed to load email invites',
                );
            }
        } catch (error) {
            console.error('Error fetching email invites:', error);
            setError(
                dict.account?.errors?.generic || 'Failed to load email invites',
            );
        } finally {
            setLoading(false);
        }
    };

    const createEmailInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setCreating(true);
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/email-invites`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        role,
                        expireInDays,
                    }),
                },
            );

            const data = await response.json();
            if (data.status === 'success') {
                setEmailInvites([data.data, ...emailInvites]);
                setError('');
                setEmail('');
                setRole(ParticipantRole.READER);
                setExpireInDays(undefined);
                setShowForm(false);
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Failed to create email invite',
                );
            }
        } catch (error) {
            console.error('Error creating email invite:', error);
            setError(
                dict.account?.errors?.generic ||
                    'Failed to create email invite',
            );
        } finally {
            setCreating(false);
        }
    };

    const deleteEmailInvite = async (inviteId: string) => {
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/email-invites/${inviteId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            const data = await response.json();
            if (data.status === 'success') {
                setEmailInvites(
                    emailInvites.filter(invite => invite.id !== inviteId),
                );
                setError('');
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Failed to delete invite',
                );
            }
        } catch (error) {
            console.error('Error deleting email invite:', error);
            setError(
                dict.account?.errors?.generic || 'Failed to delete invite',
            );
        }
    };

    const isExpired = (expiresAt: string | null): boolean => {
        if (!expiresAt) return false;
        return isAfter(new Date(), new Date(expiresAt));
    };

    const getRoleName = (role: ParticipantRole): string => {
        switch (role) {
            case ParticipantRole.ADMIN:
                return dict.calendar?.roleAdmin || 'Admin';
            case ParticipantRole.CREATOR:
                return dict.calendar?.roleCreator || 'Creator';
            case ParticipantRole.READER:
            default:
                return dict.calendar?.roleReader || 'Reader';
        }
    };

    if (readOnly) {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-center text-sm text-blue-600 dark:text-blue-400 mb-4">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>
                    {dict.calendar?.noPermissionSharing ||
                        'You do not have permission to invite users to this calendar.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {dict.calendar?.emailInvites || 'Email Invitations'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dict.calendar?.emailInvitesDescription ||
                        'Invite users by email to join this calendar.'}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                    {error}
                </div>
            )}

            {showForm ? (
                <form
                    onSubmit={createEmailInvite}
                    className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.emailAddress || 'Email Address'}{' '}
                                *
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="example@email.com"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.calendar?.roleForUser || 'User Role'}
                                </label>
                                <select
                                    value={role}
                                    onChange={e =>
                                        setRole(
                                            e.target.value as ParticipantRole,
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option value={ParticipantRole.READER}>
                                        {dict.calendar?.roleReader || 'Reader'}
                                    </option>
                                    <option value={ParticipantRole.CREATOR}>
                                        {dict.calendar?.roleCreator ||
                                            'Creator'}
                                    </option>
                                    <option value={ParticipantRole.ADMIN}>
                                        {dict.calendar?.roleAdmin || 'Admin'}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.calendar?.expiration || 'Expiration'}
                                </label>
                                <select
                                    value={
                                        expireInDays === undefined
                                            ? ''
                                            : expireInDays.toString()
                                    }
                                    onChange={e =>
                                        setExpireInDays(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option value="">
                                        {dict.calendar?.neverExpires ||
                                            'Never expires'}
                                    </option>
                                    <option value="1">
                                        {dict.calendar?.expireIn1Day ||
                                            'Expires in 1 day'}
                                    </option>
                                    <option value="7">
                                        {dict.calendar?.expireIn7Days ||
                                            'Expires in 7 days'}
                                    </option>
                                    <option value="30">
                                        {dict.calendar?.expireIn30Days ||
                                            'Expires in 30 days'}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm 
                       font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 
                       hover:bg-gray-50 dark:hover:bg-gray-600">
                                {dict.common?.cancel || 'Cancel'}
                            </button>

                            <button
                                type="submit"
                                disabled={creating || !email.trim()}
                                className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                       text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed">
                                {creating ? (
                                    <span className="flex items-center">
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
                                        {dict.calendar?.sending || 'Sending...'}
                                    </span>
                                ) : (
                                    dict.calendar?.sendInvite ||
                                    'Send Invitation'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                 text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                 focus:ring-offset-2 focus:ring-indigo-500">
                    {dict.calendar?.inviteByEmail || 'Invite by Email'}
                </button>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : emailInvites.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <Mail className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                        {dict.calendar?.noEmailInvites ||
                            'No email invitations sent yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={fetchEmailInvites}
                            className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center hover:text-indigo-800 dark:hover:text-indigo-300">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {dict.calendar?.refresh || 'Refresh'}
                        </button>
                    </div>

                    {emailInvites.map(invite => (
                        <div
                            key={invite.id}
                            className={`p-3 border rounded-md ${
                                isExpired(invite.expiresAt)
                                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center">
                                        {isExpired(invite.expiresAt) && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mr-2">
                                                {dict.calendar?.expired ||
                                                    'Expired'}
                                            </span>
                                        )}
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 text-gray-400 mr-1" />
                                            <p
                                                className={`text-sm font-medium ${
                                                    isExpired(invite.expiresAt)
                                                        ? 'text-gray-500 dark:text-gray-400'
                                                        : 'text-gray-900 dark:text-gray-100'
                                                }`}>
                                                {invite.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 gap-x-2">
                                        <span>
                                            {dict.calendar?.role || 'Role'}:{' '}
                                            {getRoleName(invite.role)}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {dict.calendar?.created ||
                                                'Created'}
                                            :{' '}
                                            {format(
                                                new Date(invite.createdAt),
                                                'MMM d, yyyy',
                                            )}
                                        </span>

                                        {invite.expiresAt && (
                                            <>
                                                <span>•</span>
                                                <span>
                                                    {dict.calendar?.expires ||
                                                        'Expires'}
                                                    :{' '}
                                                    {format(
                                                        new Date(
                                                            invite.expiresAt,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="ml-2">
                                    <button
                                        onClick={() =>
                                            deleteEmailInvite(invite.id)
                                        }
                                        className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                        title={
                                            dict.calendar?.cancelInvite ||
                                            'Cancel invitation'
                                        }>
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5 mr-2" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {dict.calendar?.emailInvitesWarning ||
                        'Email invites are linked to specific email addresses. The recipient must sign in with the exact email address to accept the invitation.'}
                </p>
            </div>
        </div>
    );
};
