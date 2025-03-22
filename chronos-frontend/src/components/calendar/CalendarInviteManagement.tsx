'use client';
import React, { useState, useEffect } from 'react';
import {
    Copy,
    ClipboardCheck,
    AlertTriangle,
    Trash2,
    CalendarClock,
    Link as LinkIcon,
    Mail,
} from 'lucide-react';
import { Dictionary } from '@/lib/dictionary';
import { format, isAfter } from 'date-fns';
import { CalendarEmailInviteManagement } from './CalendarEmailInviteManagement';

interface InviteLink {
    id: string;
    calendarId: string;
    expiresAt: string | null;
    createdAt: string;
    inviteUrl: string;
}

interface CalendarInviteManagementProps {
    calendarId: string;
    dict: Dictionary;
    readOnly?: boolean;
}

export const CalendarInviteManagement: React.FC<
    CalendarInviteManagementProps
> = ({ calendarId, dict, readOnly = false }) => {
    const [activeTab, setActiveTab] = useState<'links' | 'emails'>('links');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
    const [error, setError] = useState('');
    const [expireInDays, setExpireInDays] = useState<number | undefined>(
        undefined,
    );
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'links') {
            fetchInviteLinks();
        }
    }, [calendarId, activeTab]);

    const fetchInviteLinks = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/invite-links`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setInviteLinks(data.data);
                setError('');
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Failed to load invite links',
                );
            }
        } catch (error) {
            console.error('Error fetching invite links:', error);
            setError(
                dict.account?.errors?.generic || 'Failed to load invite links',
            );
        } finally {
            setLoading(false);
        }
    };

    const createInviteLink = async () => {
        setCreating(true);
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/invite-links`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        expireInDays,
                    }),
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setInviteLinks([data.data, ...inviteLinks]);
                setError('');
                setExpireInDays(undefined);
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Failed to create invite link',
                );
            }
        } catch (error) {
            console.error('Error creating invite link:', error);
            setError(
                dict.account?.errors?.generic || 'Failed to create invite link',
            );
        } finally {
            setCreating(false);
        }
    };

    const deleteInviteLink = async (linkId: string) => {
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/invite-links/${linkId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setInviteLinks(inviteLinks.filter(link => link.id !== linkId));
                setError('');
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Failed to delete invite link',
                );
            }
        } catch (error) {
            console.error('Error deleting invite link:', error);
            setError(
                dict.account?.errors?.generic || 'Failed to delete invite link',
            );
        }
    };

    const copyToClipboard = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isExpired = (expiresAt: string | null): boolean => {
        if (!expiresAt) return false;
        return isAfter(new Date(), new Date(expiresAt));
    };

    if (readOnly) {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-center text-sm text-blue-600 dark:text-blue-400 mb-4">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>
                    {dict.calendar?.noPermissionSharing ||
                        'You do not have permission to manage sharing for this calendar.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => setActiveTab('links')}
                        className={`py-3 px-4 font-medium text-sm border-b-2 focus:outline-none flex items-center ${
                            activeTab === 'links'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}>
                        <LinkIcon className="h-4 w-4 mr-1" />
                        {dict.calendar?.inviteLinks || 'Invite Links'}
                    </button>

                    <button
                        onClick={() => setActiveTab('emails')}
                        className={`py-3 px-4 font-medium text-sm border-b-2 focus:outline-none flex items-center ${
                            activeTab === 'emails'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}>
                        <Mail className="h-4 w-4 mr-1" />
                        {dict.calendar?.emailInvites || 'Email Invites'}
                    </button>
                </nav>
            </div>

            {activeTab === 'links' ? (
                <div className="space-y-4">
                    <div className="mb-4">
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {dict.calendar?.inviteLinks || 'Invite Links'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dict.calendar?.inviteLinksDescription ||
                                'Create and share invite links to allow others to join this calendar.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-end space-x-2 mb-4">
                        <div className="flex-1">
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

                        <button
                            onClick={createInviteLink}
                            disabled={creating}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
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
                                    {dict.calendar?.creating || 'Creating...'}
                                </span>
                            ) : (
                                dict.calendar?.createInviteLink ||
                                'Create Invite Link'
                            )}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : inviteLinks.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <CalendarClock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-400">
                                {dict.calendar?.noInviteLinks ||
                                    'No invite links created yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {inviteLinks.map(link => (
                                <div
                                    key={link.id}
                                    className={`p-3 border rounded-md ${
                                        isExpired(link.expiresAt)
                                            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-center">
                                                {isExpired(link.expiresAt) && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mr-2">
                                                        {dict.calendar
                                                            ?.expired ||
                                                            'Expired'}
                                                    </span>
                                                )}
                                                <p
                                                    className={`text-sm font-medium truncate ${
                                                        isExpired(
                                                            link.expiresAt,
                                                        )
                                                            ? 'text-gray-500 dark:text-gray-400'
                                                            : 'text-gray-900 dark:text-gray-100'
                                                    }`}
                                                    title={link.inviteUrl}>
                                                    {link.inviteUrl}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {dict.calendar?.created ||
                                                    'Created'}
                                                :{' '}
                                                {format(
                                                    new Date(link.createdAt),
                                                    'MMM d, yyyy',
                                                )}
                                                {link.expiresAt && (
                                                    <span className="ml-2">
                                                        •{' '}
                                                        {dict.calendar
                                                            ?.expires ||
                                                            'Expires'}
                                                        :{' '}
                                                        {format(
                                                            new Date(
                                                                link.expiresAt,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 ml-2">
                                            {!isExpired(link.expiresAt) && (
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            link.inviteUrl,
                                                            link.id,
                                                        )
                                                    }
                                                    className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                                    title={
                                                        dict.calendar
                                                            ?.copyLink ||
                                                        'Copy link'
                                                    }>
                                                    {copiedId === link.id ? (
                                                        <ClipboardCheck className="h-5 w-5" />
                                                    ) : (
                                                        <Copy className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    deleteInviteLink(link.id)
                                                }
                                                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                                title={
                                                    dict.calendar?.deleteLink ||
                                                    'Delete link'
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
                            {dict.calendar?.inviteLinksWarning ||
                                'Anyone with these links can join your calendar. Delete links when they are no longer needed.'}
                        </p>
                    </div>
                </div>
            ) : (
                <CalendarEmailInviteManagement
                    calendarId={calendarId}
                    dict={dict}
                />
            )}
        </div>
    );
};
