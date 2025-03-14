'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/contexts';
import {
    X,
    Trash2,
    Calendar as CalendarIcon,
    AlertTriangle,
    Link as LinkIcon,
} from 'lucide-react';
import { CalendarData } from '@/types/account';
import { CalendarInviteManagement, CategoryManagement } from '../calendar';

interface CalendarEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    calendar: CalendarData;
    onCalendarUpdated?: () => void;
    onCalendarDeleted?: () => void;
    initialTab?: 'general' | 'categories' | 'sharing';
}

export const CalendarEditModal: React.FC<CalendarEditModalProps> = ({
    isOpen,
    onClose,
    calendar,
    onCalendarUpdated,
    onCalendarDeleted,
    initialTab = 'general',
}) => {
    const router = useRouter();
    const { dict, lang } = useDictionary();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [name, setName] = useState(calendar?.name || '');
    const [description, setDescription] = useState(calendar?.description || '');
    const [color, setColor] = useState(calendar?.color || '#3B82F6');
    const [activeTab, setActiveTab] = useState<
        'general' | 'categories' | 'sharing'
    >(initialTab);

    useEffect(() => {
        if (calendar) {
            setName(calendar.name);
            setDescription(calendar.description || '');
            setColor(calendar.color);
        }
        setDeleteConfirm(false);
        setDeleteConfirmInput('');
        setShowDeleteForm(false);
        setError('');
        setActiveTab(initialTab);
    }, [calendar, initialTab]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const calendarData = {
                name,
                description: description || undefined,
                color,
            };
            const response = await fetch(
                `http://localhost:3001/calendars/${calendar.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(calendarData),
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                onClose();
                if (onCalendarUpdated) {
                    onCalendarUpdated();
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
            console.error('Error updating calendar:', error);
            setError(dict.account?.errors?.generic || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!calendar) return;
        if (!deleteConfirm) {
            setShowDeleteForm(true);
            return;
        }
        if (deleteConfirmInput !== calendar.name) {
            setError(
                dict.calendar?.deleteConfirmationError ||
                    'Calendar name does not match',
            );
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendar.id}`,
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
                if (onCalendarDeleted) {
                    onCalendarDeleted();
                }
                router.push(`/${lang}/account`);
            } else {
                setError(
                    data.message ||
                        dict.account?.errors?.generic ||
                        'Something went wrong',
                );
            }
        } catch (error) {
            console.error('Error deleting calendar:', error);
            setError(dict.account?.errors?.generic || 'Something went wrong');
        } finally {
            setLoading(false);
            setDeleteConfirm(false);
            setShowDeleteForm(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {dict.calendar?.editCalendar || 'Edit Calendar'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`py-3 px-4 font-medium text-sm border-b-2 focus:outline-none ${
                                activeTab === 'general'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}>
                            {dict.calendar?.generalSettings ||
                                'General Settings'}
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`py-3 px-4 font-medium text-sm border-b-2 focus:outline-none ${
                                activeTab === 'categories'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}>
                            {dict.calendar?.categoriesTab || 'Categories'}
                        </button>
                        <button
                            onClick={() => setActiveTab('sharing')}
                            className={`py-3 px-4 font-medium text-sm border-b-2 focus:outline-none ${
                                activeTab === 'sharing'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}>
                            <span className="flex items-center">
                                <LinkIcon className="h-4 w-4 mr-1" />
                                {dict.calendar?.sharingTab || 'Sharing'}
                            </span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center">
                                <div
                                    className="w-10 h-10 rounded-full mr-3 flex-shrink-0 flex items-center justify-center"
                                    style={{ backgroundColor: color }}>
                                    <CalendarIcon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <label
                                        htmlFor="calendar-name"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {dict.calendar?.calendarName ||
                                            'Calendar Name'}
                                        *
                                    </label>
                                    <input
                                        id="calendar-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="calendar-color"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.calendar?.calendarColor || 'Color'}
                                </label>
                                <input
                                    id="calendar-color"
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
                                    htmlFor="calendar-description"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {dict.calendar?.calendarDescription ||
                                        'Description'}
                                </label>
                                <textarea
                                    id="calendar-description"
                                    rows={3}
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeleteForm(!showDeleteForm)
                                    }
                                    className="flex items-center text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mb-2">
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    <span>
                                        {dict.calendar?.deleteCalendar ||
                                            'Delete Calendar'}
                                    </span>
                                </button>

                                {showDeleteForm && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md mb-4">
                                        <div className="flex items-start mb-2">
                                            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {dict.calendar
                                                    ?.deleteCalendarWarning ||
                                                    'This action cannot be undone. All events in this calendar will be permanently deleted.'}
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                htmlFor="delete-confirm"
                                                className="block text-sm text-red-600 dark:text-red-400 mb-1">
                                                {dict.calendar
                                                    ?.deleteConfirmation ||
                                                    `Type "${calendar.name}" to confirm deletion`}
                                            </label>
                                            <input
                                                id="delete-confirm"
                                                type="text"
                                                value={deleteConfirmInput}
                                                onChange={e =>
                                                    setDeleteConfirmInput(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm 
                                                    focus:outline-none focus:ring-red-500 focus:border-red-500 
                                                    bg-white dark:bg-gray-800 text-red-900 dark:text-red-200"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteConfirm(true);
                                                handleDelete();
                                            }}
                                            disabled={
                                                deleteConfirmInput !==
                                                calendar.name
                                            }
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md 
                                                hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                            {dict.calendar?.confirmDelete ||
                                                'Permanently Delete Calendar'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex justify-end space-x-3">
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
                    )}

                    {activeTab === 'categories' && (
                        <CategoryManagement
                            calendarId={calendar.id}
                            dict={dict}
                        />
                    )}

                    {activeTab === 'sharing' && (
                        <CalendarInviteManagement
                            calendarId={calendar.id}
                            dict={dict}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
