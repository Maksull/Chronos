'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import type { RegisterFormData, AuthResponse } from '@/types/auth';
import { useDictionary } from '@/contexts';

// Define the Country interface
interface Country {
    code: string;
    name: string;
}

export default function RegisterPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();

    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        fullName: '',
        region: '',
    });

    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    // Fetch list of countries
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                // First set some default countries in case API fails
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

                    // Format countries data
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
                    // Fall back to default countries
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

    // Get location based on IP address when the button is clicked
    const detectLocationByIP = async () => {
        setIsDetectingLocation(true);
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data.country_code) {
                setFormData(prev => ({
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(
                'http://localhost:3001/auth/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                },
            );

            const data: AuthResponse = await response.json();

            if (data.status === 'error') {
                setError(data.message || dict.auth.errors.generic);
                return;
            }

            if (data.data?.token) {
                // Store the token and email in localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('verificationEmail', formData.email);

                // Redirect to the verification page
                router.push(`/${lang}/verify-email`);
            }
        } catch {
            setError(dict.auth.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Calendar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {dict.auth.register.title}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {dict.auth.register.subtitle}{' '}
                    <Link
                        href={`/${lang}/login`}
                        className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                        {dict.auth.register.loginLink}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-dark-surface py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.fields.username}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.fields.email}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.fields.password}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {dict.auth.register.passwordRequirement}
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.fields.fullName}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="region"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dict.auth.fields.region}
                            </label>
                            <div className="mt-1 relative">
                                <select
                                    id="region"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 text-gray-900 dark:text-white appearance-none"
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
                                            {dict.auth.register.useIpLocation ||
                                                'Detect my country'}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {dict.auth.register.termsText}{' '}
                                <Link
                                    href={`/${lang}/terms`}
                                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                                    {dict.auth.register.termsLink}
                                </Link>
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading
                                ? dict.auth.register.loading
                                : dict.auth.register.submit}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
