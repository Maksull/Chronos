'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useDictionary } from '@/contexts';
import {
    AlertMessage,
    CalendarSection,
    ProfileSection,
    ProtectedRoute,
    StatsSection,
} from '@/components';
import { ProfileData, CalendarData } from '@/types/account';
import {useRouter} from 'next/navigation';

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
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error fetching profile:', error);
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
                                {profileData.createdAt
                                    ? new Date(
                                        profileData.createdAt,
                                    ).toLocaleDateString()
                                    : ''}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push(`/${lang}/account/settings`)}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-700 dark:text-gray-200">
                        <Shield className="h-5 w-5" />
                        {dict.account.settings}
                    </button>
                </div>

                {error && <AlertMessage type="error" message={error} />}
                {success && (
                    <AlertMessage type="success" message={success} />
                )}

                <StatsSection
                    profileData={profileData}
                    calendarCount={calendars.length}
                    dict={dict}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ProfileSection
                        profileData={profileData}
                        setProfileData={setProfileData}
                        onUpdate={handleProfileUpdate}
                        isLoading={isLoading}
                        dict={dict}
                    />

                    <CalendarSection
                        calendars={calendars}
                        refreshCalendars={fetchUserCalendars}
                        setError={setError}
                        setSuccess={setSuccess}
                        dict={dict}
                    />
                </div>
            </div>
        </div>
        </ProtectedRoute >
    );
}
