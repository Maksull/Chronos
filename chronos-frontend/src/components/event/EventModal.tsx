'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDictionary } from '@/contexts';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { EventCategory } from '@/types/account';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    calendarId: string;
    date?: Date;
    onEventCreated?: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    calendarId,
    date = new Date(),
    onEventCreated,
}) => {
    const router = useRouter();
    const params = useParams();
    const { dict, lang } = useDictionary();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [name, setName] = useState('');
    // We're storing the enum value internally but will convert to lowercase when sending to the API
    const [category, setCategory] = useState<EventCategory>(
        EventCategory.ARRANGEMENT,
    );
    const [startDate, setStartDate] = useState<string>(
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
        )
            .toISOString()
            .slice(0, 16),
    );
    const [endDate, setEndDate] = useState<string>(
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours() + 1,
        )
            .toISOString()
            .slice(0, 16),
    );
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6');

    if (!isOpen) return null;

    // Helper function to format dates for the backend (with timezone)
    const formatDateForApi = (dateString: string): string => {
        // Convert local datetime string to ISO format with timezone
        const date = new Date(dateString);
        return date.toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Ensure we're passing the correct data format expected by the backend
            // Convert the category to lowercase for the API
            const categoryValue = category.toString(); // No longer need to convert to lowercase

            const eventData = {
                name,
                category: categoryValue,
                startDate: formatDateForApi(startDate), // Format with timezone
                endDate: formatDateForApi(endDate), // Format with timezone
                description: description || undefined,
                color,
            };

            console.log('Submitting event data:', eventData);

            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/events`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(eventData),
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                onClose();
                if (onEventCreated) {
                    onEventCreated();
                }
                router.refresh();
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Something went wrong',
                );
            }
        } catch (error) {
            console.error('Error creating event:', error);
            setError(dict.account?.errors?.generic || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {dict.calendar?.addEvent || 'Add Event'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="event-name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.eventName || 'Event Name'}*
                            </label>
                            <input
                                id="event-name"
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="event-category"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.eventCategory || 'Category'}*
                            </label>
                            {/* 
                Note: We use uppercase enum values (EventCategory.ARRANGEMENT) to match 
                what the backend API expects ('ARRANGEMENT')
              */}
                            <select
                                id="event-category"
                                required
                                value={category.toString()}
                                onChange={e => {
                                    // Map the string value back to enum
                                    const value = e.target.value;
                                    if (value === 'ARRANGEMENT')
                                        setCategory(EventCategory.ARRANGEMENT);
                                    else if (value === 'REMINDER')
                                        setCategory(EventCategory.REMINDER);
                                    else if (value === 'TASK')
                                        setCategory(EventCategory.TASK);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="ARRANGEMENT">
                                    {dict.calendar?.categoryArrangement ||
                                        'Arrangement'}
                                </option>
                                <option value="REMINDER">
                                    {dict.calendar?.categoryReminder ||
                                        'Reminder'}
                                </option>
                                <option value="TASK">
                                    {dict.calendar?.categoryTask || 'Task'}
                                </option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="start-date"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.calendar?.startDateTime ||
                                        'Start Date & Time'}
                                    *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="start-date"
                                        type="datetime-local"
                                        required
                                        value={startDate}
                                        onChange={e =>
                                            setStartDate(e.target.value)
                                        }
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                               focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="end-date"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.calendar?.endDateTime ||
                                        'End Date & Time'}
                                    *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="end-date"
                                        type="datetime-local"
                                        required
                                        value={endDate}
                                        onChange={e =>
                                            setEndDate(e.target.value)
                                        }
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                               focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="event-color"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.eventColor || 'Color'}
                            </label>
                            <input
                                id="event-color"
                                type="color"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                className="w-full h-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                           bg-white dark:bg-gray-700"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="event-description"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.eventDescription ||
                                    'Description'}
                            </label>
                            <textarea
                                id="event-description"
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium 
                         text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            {dict.common?.cancel || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                         text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? (
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
                                    {dict.common?.saving || 'Saving...'}
                                </span>
                            ) : (
                                dict.common?.save || 'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
