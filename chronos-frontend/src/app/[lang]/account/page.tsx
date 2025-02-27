'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    UserCircle,
    Calendar,
    Globe,
    Eye,
    EyeOff,
    Trash2,
    Plus,
    X,
    Shield,
} from 'lucide-react';
import { useDictionary } from '@/contexts';
import { ProtectedRoute } from '@/components';

interface ProfileData {
    username: string;
    fullName: string;
    email: string;
    region: string;
    createdAt: string;
}

interface CalendarData {
    id: string;
    name: string;
    description: string | null;
    color: string;
    isMain: boolean;
    isHoliday: boolean;
    isVisible: boolean;
}

interface CalendarFormData {
    name: string;
    description: string;
    color: string;
}

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
};

export default function AccountPage() {
    const { dict, lang } = useDictionary();
    const [profileData, setProfileData] = useState<ProfileData>({
        username: '',
        fullName: '',
        email: '',
        region: '',
        createdAt: '',
    });
    const [calendars, setCalendars] = useState<CalendarData[]>([]);
    const [newCalendarData, setNewCalendarData] = useState<CalendarFormData>({
        name: '',
        description: '',
        color: '#3B82F6',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);

    useEffect(() => {
        fetchUserProfile();
        fetchUserCalendars();
    }, []);

    const fetchUserProfile = async () => {
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
                setProfileData(data.data);
            }
        } catch {
            setError(dict.account.errors.generic);
        }
    };

    const fetchUserCalendars = async () => {
        try {
            const response = await fetch('http://localhost:3001/calendars', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            if (data.status === 'success') {
                setCalendars(data.data);
            }
        } catch {
            setError(dict.account.errors.generic);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(
                'http://localhost:3001/users/profile',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        fullName: profileData.fullName,
                        region: profileData.region,
                    }),
                },
            );

            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.account.errors.generic);
                return;
            }
            setSuccess(dict.account.profile.updateSuccess);
        } catch {
            setError(dict.account.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalendarCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/calendars', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(newCalendarData),
            });

            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.account.errors.generic);
                return;
            }

            setSuccess(dict.account.calendars.createSuccess);
            setNewCalendarData({ name: '', description: '', color: '#3B82F6' });
            setIsCreatingCalendar(false);
            fetchUserCalendars();
        } catch {
            setError(dict.account.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCalendarVisibility = async (
        calendarId: string,
        isVisible: boolean,
    ) => {
        try {
            await fetch(
                `http://localhost:3001/calendars/${calendarId}/visibility`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ isVisible }),
                },
            );
            fetchUserCalendars();
        } catch {
            setError(dict.account.errors.generic);
        }
    };

    const deleteCalendar = async (calendarId: string) => {
        if (!window.confirm(dict.account.calendars.deleteConfirm)) return;

        try {
            await fetch(`http://localhost:3001/calendars/${calendarId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            fetchUserCalendars();
            setSuccess(dict.account.calendars.deleteSuccess);
        } catch {
            setError(dict.account.errors.generic);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {dict.account.welcome.replace(
                                    '{name}',
                                    profileData.fullName ||
                                        profileData.username,
                                )}
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {dict.account.stats.member}{' '}
                                {formatDate(profileData.createdAt)}
                            </p>
                        </div>

                        <Link
                            href={`/${lang}/account/settings`}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-200">
                            <Shield className="h-5 w-5" />
                            {dict.account.settings}
                        </Link>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {dict.account.stats.totalCalendars}
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        {calendars.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg">
                                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {dict.account.stats.region}
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        {profileData.region ||
                                            dict.account.stats.noRegion}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                                    <UserCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {dict.account.stats.member}
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        {formatDate(profileData.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <UserCircle className="h-6 w-6 text-gray-400" />
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {dict.account.profile.title}
                                        </h2>
                                    </div>

                                    <form
                                        onSubmit={handleProfileUpdate}
                                        className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {
                                                        dict.account.fields
                                                            .username
                                                    }
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.username}
                                                    disabled
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {dict.account.fields.email}
                                                </label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {
                                                        dict.account.fields
                                                            .fullName
                                                    }
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.fullName}
                                                    onChange={e =>
                                                        setProfileData(
                                                            prev => ({
                                                                ...prev,
                                                                fullName:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {dict.account.fields.region}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.region}
                                                    onChange={e =>
                                                        setProfileData(
                                                            prev => ({
                                                                ...prev,
                                                                region: e.target
                                                                    .value,
                                                            }),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                                            {isLoading
                                                ? dict.account.common.loading
                                                : dict.account.profile.update}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-6 w-6 text-gray-400" />
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {dict.account.calendars.title}
                                            </h2>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setIsCreatingCalendar(
                                                    !isCreatingCalendar,
                                                )
                                            }
                                            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                                            {isCreatingCalendar ? (
                                                <>
                                                    <X className="h-4 w-4" />
                                                    {
                                                        dict.account.calendars
                                                            .cancel
                                                    }
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4" />
                                                    {
                                                        dict.account.calendars
                                                            .create
                                                    }
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {isCreatingCalendar && (
                                        <form
                                            onSubmit={handleCalendarCreate}
                                            className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {
                                                            dict.account
                                                                .calendars
                                                                .fields.name
                                                        }
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={
                                                            newCalendarData.name
                                                        }
                                                        onChange={e =>
                                                            setNewCalendarData(
                                                                prev => ({
                                                                    ...prev,
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {
                                                            dict.account
                                                                .calendars
                                                                .fields.color
                                                        }
                                                    </label>
                                                    <input
                                                        type="color"
                                                        value={
                                                            newCalendarData.color
                                                        }
                                                        onChange={e =>
                                                            setNewCalendarData(
                                                                prev => ({
                                                                    ...prev,
                                                                    color: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 px-1 dark:bg-gray-700"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {
                                                        dict.account.calendars
                                                            .fields.description
                                                    }
                                                </label>
                                                <textarea
                                                    value={
                                                        newCalendarData.description
                                                    }
                                                    onChange={e =>
                                                        setNewCalendarData(
                                                            prev => ({
                                                                ...prev,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700"
                                                    rows={3}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                                                {isLoading
                                                    ? dict.account.common
                                                          .loading
                                                    : dict.account.calendars
                                                          .createSubmit}
                                            </button>
                                        </form>
                                    )}

                                    <div className="space-y-4">
                                        {calendars.map(calendar => (
                                            <div
                                                key={calendar.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl transition-all hover:shadow-sm"
                                                style={{
                                                    borderLeft: `4px solid ${calendar.color}`,
                                                }}>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {calendar.isHoliday && (
                                                            <Globe className="h-4 w-4 text-gray-400" />
                                                        )}
                                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                                            {calendar.name}
                                                        </h3>
                                                        {calendar.isMain && (
                                                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                                                                {
                                                                    dict.account
                                                                        .calendars
                                                                        .main
                                                                }
                                                            </span>
                                                        )}
                                                        {calendar.isHoliday && (
                                                            <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                                                                {
                                                                    dict.account
                                                                        .calendars
                                                                        .holidays
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {calendar.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {
                                                                calendar.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() =>
                                                            toggleCalendarVisibility(
                                                                calendar.id,
                                                                !calendar.isVisible,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                        disabled={
                                                            calendar.isMain
                                                        }
                                                        title={
                                                            calendar.isVisible
                                                                ? dict.account
                                                                      .calendars
                                                                      .hide
                                                                : dict.account
                                                                      .calendars
                                                                      .show
                                                        }>
                                                        {calendar.isVisible ? (
                                                            <Eye className="h-5 w-5" />
                                                        ) : (
                                                            <EyeOff className="h-5 w-5" />
                                                        )}
                                                    </button>

                                                    {!calendar.isMain &&
                                                        !calendar.isHoliday && (
                                                            <button
                                                                onClick={() =>
                                                                    deleteCalendar(
                                                                        calendar.id,
                                                                    )
                                                                }
                                                                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                                                                title={
                                                                    dict.account
                                                                        .calendars
                                                                        .delete
                                                                }>
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
