'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/contexts';
import {
    X,
    Calendar as CalendarIcon,
    Clock,
    Edit2,
    Trash2,
    Check,
    ArrowLeft,
    Info,
    User,
} from 'lucide-react';
import { CategoryData, EventData, ParticipantRole } from '@/types/account';
import { CategorySelector } from '../calendar';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    calendarId: string;
    mode: 'create' | 'view' | 'edit';
    date?: Date;
    event?: EventData;
    onEventCreated?: () => void;
    onEventUpdated?: () => void;
    onEventDeleted?: () => void;
    canEdit?: boolean;
    userRole?: ParticipantRole;
}

export const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    calendarId,
    mode: initialMode = 'create',
    date = new Date(),
    event,
    onEventCreated,
    onEventUpdated,
    onEventDeleted,
    canEdit,
    userRole,
}) => {
    const router = useRouter();
    const { dict } = useDictionary();
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6');

    // Determine user permissions
    const isCreator = event?.creator?.id === localStorage.getItem('userId');
    const isAdmin = userRole === ParticipantRole.ADMIN;

    // User can edit if:
    // 1. They're explicitly given edit permission via prop
    // 2. They're an admin
    // 3. They created the event
    // 4. It's a new event and they have CREATOR or ADMIN role
    const userCanEdit =
        canEdit ||
        isAdmin ||
        isCreator ||
        (mode === 'create' &&
            userRole !== undefined &&
            userRole === ParticipantRole.CREATOR);

    useEffect(() => {
        fetchCategories();
    }, [calendarId]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/categories`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setCategories(data.data || []);
                if (data.data && data.data.length > 0 && !categoryId) {
                    setCategoryId(data.data[0].id);
                }
            } else {
                console.error('Error fetching categories:', data.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        // If user can't edit but tries to enter edit mode, force view mode
        if (mode === 'edit' && !userCanEdit) {
            setMode('view');
        }

        if (mode === 'create') {
            setName('');
            const formatDateForInput = (d: Date): string => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            const startTime = new Date(date);
            setStartDate(formatDateForInput(startTime));

            const endTime = new Date(date);
            endTime.setHours(endTime.getHours() + 1);
            setEndDate(formatDateForInput(endTime));

            setDescription('');
            setColor('#3B82F6');

            if (categories.length > 0) {
                setCategoryId(categories[0].id);
            }
        } else if (event && (mode === 'view' || mode === 'edit')) {
            setName(event.name);
            setCategoryId(event.category.id);

            const formatEventDateForInput = (dateString: string): string => {
                const d = new Date(dateString);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setStartDate(formatEventDateForInput(event.startDate));
            setEndDate(formatEventDateForInput(event.endDate));
            setDescription(event.description || '');
            setColor(event.color);
        }

        setDeleteConfirm(false);
        setError('');
    }, [event, mode, date, categories, userCanEdit]);

    if (!isOpen) return null;

    const formatDateForApi = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check permissions before proceeding
        if (
            (mode === 'edit' && !userCanEdit) ||
            (mode === 'create' && userRole === ParticipantRole.READER)
        ) {
            setError(
                dict.calendar?.noPermission ||
                    'You do not have permission to perform this action',
            );
            return;
        }

        setLoading(true);
        setError('');

        try {
            const eventData = {
                name,
                categoryId,
                startDate: formatDateForApi(startDate),
                endDate: formatDateForApi(endDate),
                description: description || undefined,
                color,
            };

            let response;
            let successCallback;

            if (mode === 'create') {
                response = await fetch(
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
                successCallback = onEventCreated;
            } else if (mode === 'edit' && event) {
                response = await fetch(
                    `http://localhost:3001/calendars/${calendarId}/events/${event.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify(eventData),
                    },
                );
                successCallback = onEventUpdated;
            } else {
                throw new Error('Invalid operation');
            }

            const data = await response.json();

            if (data.status === 'success') {
                onClose();
                if (successCallback) {
                    successCallback();
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
            console.error('Error with event:', error);
            setError(dict.account?.errors?.generic || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!event) return;

        // Check permissions before proceeding
        if (!userCanEdit) {
            setError(
                dict.calendar?.noPermission ||
                    'You do not have permission to delete this event',
            );
            return;
        }

        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/events/${event.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                onClose();
                if (onEventDeleted) {
                    onEventDeleted();
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
            console.error('Error deleting event:', error);
            setError(dict.account?.errors?.generic || 'Something went wrong');
        } finally {
            setLoading(false);
            setDeleteConfirm(false);
        }
    };

    let title = dict.calendar?.addEvent || 'Add Event';
    if (mode === 'view') title = dict.calendar?.viewEvent || 'View Event';
    if (mode === 'edit') title = dict.calendar?.editEvent || 'Edit Event';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <div className="flex space-x-2">
                        {/* Only show Edit button if user can edit */}
                        {mode === 'view' && userCanEdit && (
                            <button
                                onClick={() => setMode('edit')}
                                className="text-gray-600 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center"
                                title={dict.common?.edit || 'Edit'}>
                                <Edit2 className="h-5 w-5" />
                            </button>
                        )}
                        {mode === 'edit' && (
                            <button
                                onClick={() => setMode('view')}
                                className="text-gray-600 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center"
                                title={dict.common?.back || 'Back to Details'}>
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Permission indicator when in view-only mode */}
                {!userCanEdit && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                        <Info className="h-4 w-4 mr-2" />
                        <span>
                            {dict.calendar?.viewOnlyMode ||
                                'View-only mode. You cannot edit this event.'}
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Creator/owner info - only when viewing existing events */}
                    {mode !== 'create' && event?.creator && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center text-sm">
                            <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-3">
                                {isCreator ? (
                                    <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                ) : (
                                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {isCreator
                                        ? dict.calendar?.youCreatedThis ||
                                          'You created this event'
                                        : `${dict.calendar?.createdBy || 'Created by'}: ${event.creator.username || 'Unknown'}`}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(event.createdAt).toLocaleString()}
                                </p>
                            </div>
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
                                readOnly={mode === 'view'}
                                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                   focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   ${mode === 'view' ? 'opacity-80 cursor-default' : ''}`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="event-category"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.eventCategory || 'Category'}*
                            </label>
                            {loadingCategories ? (
                                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    {dict.account.common.loading ||
                                        'Loading categories...'}
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    {dict.calendar?.noCategories ||
                                        'No categories available'}
                                </div>
                            ) : (
                                <CategorySelector
                                    categories={categories}
                                    selectedCategoryId={categoryId}
                                    onChange={id => {
                                        setCategoryId(id); // Set the selected category
                                        const selectedCategory =
                                            categories.find(
                                                cat => cat.id === id,
                                            );
                                        if (selectedCategory) {
                                            setColor(selectedCategory.color); // Set the color to the selected category's color
                                        }
                                    }}
                                    calendarId={calendarId}
                                    mode={mode}
                                    dict={dict}
                                    onCategoriesUpdated={fetchCategories}
                                    readOnly={mode === 'view' || !userCanEdit}
                                />
                            )}
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
                                {mode === 'view' ? (
                                    <div className="relative w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white opacity-80">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                        </div>
                                        {new Date(startDate).toLocaleString()}
                                    </div>
                                ) : (
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
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="end-date"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.calendar?.endDateTime ||
                                        'End Date & Time'}
                                    *
                                </label>
                                {mode === 'view' ? (
                                    <div className="relative w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white opacity-80">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                        </div>
                                        {new Date(endDate).toLocaleString()}
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="event-color"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.eventColor || 'Color'}
                            </label>
                            {mode === 'view' ? (
                                <div className="w-full h-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
                                    <div
                                        className="h-full rounded"
                                        style={{
                                            backgroundColor: color,
                                        }}></div>
                                </div>
                            ) : (
                                <input
                                    id="event-color"
                                    type="color"
                                    value={color}
                                    onChange={e => setColor(e.target.value)}
                                    className="w-full h-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                                        bg-white dark:bg-gray-700"
                                />
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="event-description"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.calendar?.eventDescription ||
                                    'Description'}
                            </label>
                            {mode === 'view' ? (
                                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[72px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white opacity-80 whitespace-pre-wrap">
                                    {description || (
                                        <span className="text-gray-400 italic">
                                            {dict.calendar?.noDescription ||
                                                'No description provided'}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    id="event-description"
                                    rows={3}
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex justify-between">
                        <div>
                            {/* Delete button - only visible when viewing existing events and user has permission */}
                            {mode !== 'create' &&
                                userCanEdit &&
                                (isAdmin || isCreator) && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                                     flex items-center space-x-1
                                     ${
                                         deleteConfirm
                                             ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                             : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                                     }`}>
                                        {deleteConfirm ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                <span>
                                                    {dict.common?.confirm ||
                                                        'Confirm'}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                <span>
                                                    {dict.common?.delete ||
                                                        'Delete'}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                )}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium 
                                    text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                {dict.common?.cancel || 'Cancel'}
                            </button>

                            {/* Only show Save button in create/edit mode and when user has permission */}
                            {mode !== 'view' && userCanEdit && (
                                <button
                                    type="submit"
                                    disabled={
                                        loading || categories.length === 0
                                    }
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
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
