'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useDictionary } from '@/contexts';
import {
    AlertMessage,
    CalendarSection,
    ProfileSection,
    ProtectedRoute,
    StatsSection,
} from '@/components';
import { ProfileData, CalendarData } from '@/types/account';
import { useRouter } from 'next/navigation';

// Add pagination and count interfaces
interface PaginationData {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}

interface CalendarCounts {
    visible: number;
    hidden: number;
    total: number;
}

export default function AccountPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();

    const [profileData, setProfileData] = useState<ProfileData>({
        username: '',
        fullName: '',
        email: '',
        region: '',
        createdAt: '',
    });
    const [calendars, setCalendars] = useState<CalendarData[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Add state for active tab
    const [activeTab, setActiveTab] = useState<'active' | 'hidden'>('active');

    // Add pagination and count states
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 7,
        totalCount: 0,
        totalPages: 1,
    });

    const [calendarCounts, setCalendarCounts] = useState<CalendarCounts>({
        visible: 0,
        hidden: 0,
        total: 0,
    });

    useEffect(() => {
        fetchUserProfile();
        fetchUserCalendars(1);
    }, []);

    // Reset page when changing tab
    useEffect(() => {
        fetchUserCalendars(1);
    }, [activeTab]);

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
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error fetching profile:', error);
        }
    };

    const fetchUserCalendars = async (page: number = 1, limit: number = 7) => {
        try {
            // Add visibility parameter based on active tab
            const visibility = activeTab === 'active' ? 'visible' : 'hidden';

            const response = await fetch(
                `http://localhost:3001/calendars?page=${page}&limit=${limit}&visibility=${visibility}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setCalendars(data.data);

                // Update pagination data if available
                if (data.pagination) {
                    setPagination(data.pagination);
                }

                // Update calendar counts if available
                if (data.counts) {
                    setCalendarCounts(data.counts);
                }
            }
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error fetching calendars:', error);
        }
    };

    const handleProfileUpdate = async (
        updatedProfile: Partial<ProfileData>,
    ) => {
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
                        username: updatedProfile.username,
                        fullName: updatedProfile.fullName,
                        region: updatedProfile.region,
                    }),
                },
            );

            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.account.errors.generic);
                return;
            }
            setSuccess(dict.account.profile.updateSuccess);
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Add handler for pagination changes
    const handlePageChange = (newPage: number) => {
        fetchUserCalendars(newPage, pagination.limit);
    };

    // Add handler for tab changes
    const handleTabChange = (tab: 'active' | 'hidden') => {
        setActiveTab(tab);
        // fetchUserCalendars will be called via useEffect
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CalendarIcon className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                                    <span className="block sm:inline">
                                        {dict.account.welcome}
                                    </span>
                                    <span className="sm:inline font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
                                        {profileData.fullName ||
                                            profileData.username}
                                    </span>
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400 flex items-center">
                                    {dict.account.stats.member}{' '}
                                    <span className="font-medium ml-1">
                                        {profileData.createdAt
                                            ? new Date(
                                                  profileData.createdAt,
                                              ).toLocaleDateString()
                                            : ''}
                                    </span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(`/${lang}/account/settings`)
                                }
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-700 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-600 group">
                                <Shield className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                <span>{dict.account.settings}</span>
                                <ChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                            </button>
                        </div>
                    </div>

                    {error && <AlertMessage type="error" message={error} />}
                    {success && (
                        <AlertMessage type="success" message={success} />
                    )}

                    <StatsSection
                        profileData={profileData}
                        calendarCount={calendarCounts.total}
                        dict={dict}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <ProfileSection
                                profileData={profileData}
                                setProfileData={setProfileData}
                                onUpdate={handleProfileUpdate}
                                isLoading={isLoading}
                                dict={dict}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <CalendarSection
                                calendars={calendars}
                                refreshCalendars={() =>
                                    fetchUserCalendars(
                                        pagination.page,
                                        pagination.limit,
                                    )
                                }
                                setError={setError}
                                setSuccess={setSuccess}
                                dict={dict}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                pagination={pagination}
                                calendarCounts={calendarCounts}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
