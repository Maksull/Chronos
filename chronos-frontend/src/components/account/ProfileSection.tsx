'use client';

import React, { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { Dictionary } from '@/lib/dictionary';
import { ProfileData } from '@/types/account';

interface Country {
    code: string;
    name: string;
}

interface ProfileSectionProps {
    profileData: ProfileData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
    onUpdate: (updatedProfile: Partial<ProfileData>) => Promise<void>;
    isLoading: boolean;
    dict: Dictionary;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
    profileData,
    setProfileData,
    onUpdate,
    isLoading,
    dict,
}) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const defaultCountries: Country[] = [
                    { code: 'US', name: 'United States' },
                    { code: 'GB', name: 'United Kingdom' },
                    { code: 'CA', name: 'Canada' },
                    { code: 'AU', name: 'Australia' },
                    { code: 'DE', name: 'Germany' },
                    { code: 'FR', name: 'France' },
                    { code: 'JP', name: 'Japan' },
                    { code: 'CN', name: 'China' },
                    { code: 'BR', name: 'Brazil' },
                    { code: 'IN', name: 'India' },
                ];
                try {
                    const response = await fetch(
                        'https://restcountries.com/v3.1/all',
                    );
                    const data = await response.json();
                    const formattedCountries = data
                        .map((country: any) => ({
                            code: country.cca2,
                            name: country.name.common,
                        }))
                        .sort((a: Country, b: Country) =>
                            a.name.localeCompare(b.name),
                        );
                    setCountries(formattedCountries);
                } catch (apiError) {
                    console.error(
                        'Failed to fetch countries from API:',
                        apiError,
                    );
                    setCountries(defaultCountries);
                }
            } catch (error) {
                console.error(
                    'Unexpected error in country initialization:',
                    error,
                );
            }
        };
        fetchCountries();
    }, []);

    const detectLocationByIP = async () => {
        setIsDetectingLocation(true);
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.country_code) {
                setProfileData(prev => ({
                    ...prev,
                    region: data.country_code,
                }));
            }
        } catch (error) {
            console.log(
                'Could not determine location, please select your country manually.',
            );
        } finally {
            setIsDetectingLocation(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(profileData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setProfileData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const getCountryNameByCode = (code: string): string => {
        const country = countries.find(c => c.code === code);
        return country ? country.name : code;
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <UserCircle className="h-6 w-6 text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {dict.account.profile.title}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.account.fields.username}
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={profileData.username}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.account.fields.fullName}
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profileData.fullName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {dict.account.fields.region}
                                </label>
                                <div className="relative">
                                    <select
                                        name="region"
                                        value={profileData.region}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white appearance-none"
                                        disabled={isDetectingLocation}>
                                        <option value="">
                                            {dict.auth.register.selectCountry ||
                                                'Select a country'}
                                        </option>
                                        {countries.map(country => (
                                            <option
                                                key={country.code}
                                                value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                        <svg
                                            className="fill-current h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={detectLocationByIP}
                                        disabled={isDetectingLocation}
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none flex items-center">
                                        {isDetectingLocation ? (
                                            <span>
                                                {dict.auth.register
                                                    .detectingLocation ||
                                                    'Detecting your location...'}
                                            </span>
                                        ) : (
                                            <span>
                                                {dict.auth.register
                                                    .useIpLocation ||
                                                    'Detect my country'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50">
                            {isLoading
                                ? dict.account.common.loading
                                : dict.account.profile.update}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
