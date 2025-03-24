'use client';
import React, { useState } from 'react';
import {
    Calendar,
    Plus,
    X,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
    ChevronRight,
} from 'lucide-react';
import { CalendarData, CalendarFormData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';
import { CalendarForm, CalendarItem } from '.';
import { DeleteConfirmationModal } from '..';
import { useRouter } from 'next/navigation';

interface CalendarSectionProps {
    calendars: CalendarData[];
    refreshCalendars: () => Promise<void>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    setSuccess: React.Dispatch<React.SetStateAction<string>>;
    dict: Dictionary;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
    calendars,
    refreshCalendars,
    setError,
    setSuccess,
    dict,
}) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'hidden'>('active');
    const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newCalendarData, setNewCalendarData] = useState<CalendarFormData>({
        name: '',
        description: '',
        color: '#3B82F6',
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [calendarToDelete, setCalendarToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const createEmptyCalendar = async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const defaultName = `${dict.account.calendars.defaultName || 'New Calendar'} ${calendars.length + 1}`;
            const response = await fetch('http://localhost:3001/calendars', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: defaultName,
                    description: '',
                    color: '#3B82F6',
                }),
            });
            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.account.errors.generic);
                return;
            }
            setSuccess(dict.account.calendars.createSuccess);
            refreshCalendars();
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error creating empty calendar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalendarCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        if (!newCalendarData.name.trim()) {
            setError(
                dict.account.calendars.nameRequired ||
                    'Calendar name is required',
            );
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/calendars', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: newCalendarData.name,
                    description: newCalendarData.description || null,
                    color: newCalendarData.color || '#3B82F6',
                }),
            });
            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.account.errors.generic);
                return;
            }
            setSuccess(dict.account.calendars.createSuccess);
            setNewCalendarData({
                name: '',
                description: '',
                color: '#3B82F6',
            });
            setIsCreatingCalendar(false);
            refreshCalendars();
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error creating calendar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCalendarVisibility = async (
        calendarId: string,
        isVisible: boolean,
    ) => {
        try {
            const response = await fetch(
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
            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.account.errors.generic);
                return;
            }
            refreshCalendars();
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error toggling calendar visibility:', error);
        }
    };

    const handleDeleteRequest = (calendar: CalendarData) => {
        setCalendarToDelete({
            id: calendar.id,
            name: calendar.name,
        });
        setDeleteModalOpen(true);
    };

    const deleteCalendar = async () => {
        if (!calendarToDelete) return;
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarToDelete.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'error') {
                setError(data.message || dict.account.errors.generic);
                return;
            }
            refreshCalendars();
            setSuccess(dict.account.calendars.deleteSuccess);
        } catch (error) {
            setError(dict.account.errors.generic);
            console.error('Error deleting calendar:', error);
        } finally {
            setDeleteModalOpen(false);
            setCalendarToDelete(null);
        }
    };

    // Updated CalendarItem component inline
    const ModernCalendarItem = ({
        calendar,
        onToggleVisibility,
        onDelete,
        dict,
    }) => {
        const navigateToCalendar = e => {
            // Prevent triggering if clicking on the buttons
            if (e.target.closest('button')) return;
            router.push(`/calendar/${calendar.id}`);
        };

        return (
            <div
                className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
                style={{ borderLeft: `4px solid ${calendar.color}` }}
                onClick={navigateToCalendar}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${calendar.color}20` }}>
                            <Calendar
                                className="h-5 w-5"
                                style={{ color: calendar.color }}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 flex items-center gap-1">
                                {calendar.name}
                                <ChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-indigo-500" />
                            </h3>
                            {calendar.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                    {calendar.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 z-10">
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                onToggleVisibility(
                                    calendar.id,
                                    !calendar.isVisible,
                                );
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {calendar.isVisible ? (
                                <Eye className="h-5 w-5" />
                            ) : (
                                <EyeOff className="h-5 w-5" />
                            )}
                        </button>
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 h-12"></div>
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 -mt-10">
                        <div className="flex items-center gap-3 mb-4 sm:mb-0">
                            <div className="bg-white dark:bg-gray-700 p-3 rounded-xl shadow-lg">
                                <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {dict.account.calendars.title}
                            </h2>
                        </div>

                        <div className="flex w-full sm:w-auto gap-2 justify-between">
                            <button
                                onClick={createEmptyCalendar}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 w-full sm:w-auto">
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                {dict.account.calendars.create ||
                                    'Create Calendar'}
                            </button>

                            <button
                                onClick={() =>
                                    setIsCreatingCalendar(!isCreatingCalendar)
                                }
                                className="flex items-center gap-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-600 transition-all duration-200 w-full sm:w-auto">
                                {isCreatingCalendar ? (
                                    <>
                                        <X className="h-4 w-4" />
                                        {dict.account.calendars.cancel ||
                                            'Cancel'}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        {dict.account.calendars.advanced ||
                                            'Advanced'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTab === 'active'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                {dict.account.calendars.activeTabs?.visible ||
                                    'Active Calendars'}
                                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {
                                        calendars.filter(
                                            calendar => calendar.isVisible,
                                        ).length
                                    }
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('hidden')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTab === 'hidden'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}>
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-4 w-4" />
                                {dict.account.calendars.activeTabs?.hidden ||
                                    'Hidden Calendars'}
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {
                                        calendars.filter(
                                            calendar => !calendar.isVisible,
                                        ).length
                                    }
                                </span>
                            </div>
                        </button>
                    </div>

                    {isCreatingCalendar && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                            <CalendarForm
                                newCalendarData={newCalendarData}
                                setNewCalendarData={setNewCalendarData}
                                onSubmit={handleCalendarCreate}
                                isLoading={isLoading}
                                dict={dict}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Filter calendars based on active tab */}
                        {calendars.filter(calendar =>
                            activeTab === 'active'
                                ? calendar.isVisible
                                : !calendar.isVisible,
                        ).length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <div
                                    className={
                                        activeTab === 'active'
                                            ? 'text-indigo-500 dark:text-indigo-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }>
                                    {activeTab === 'active' ? (
                                        <Calendar className="h-12 w-12 mx-auto mb-3" />
                                    ) : (
                                        <EyeOff className="h-12 w-12 mx-auto mb-3" />
                                    )}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {activeTab === 'active'
                                        ? dict.account.calendars.emptyActive ||
                                          'No active calendars found. Create one to get started!'
                                        : dict.account.calendars.emptyHidden ||
                                          'No hidden calendars found.'}
                                </p>
                                {activeTab === 'active' && (
                                    <button
                                        onClick={createEmptyCalendar}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                                        <Plus className="h-4 w-4" />
                                        {dict.account.calendars.createFirst ||
                                            'Create Your First Calendar'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {calendars
                                    .filter(calendar =>
                                        activeTab === 'active'
                                            ? calendar.isVisible
                                            : !calendar.isVisible,
                                    )
                                    .map(calendar => (
                                        <ModernCalendarItem
                                            key={calendar.id}
                                            calendar={calendar}
                                            onToggleVisibility={
                                                toggleCalendarVisibility
                                            }
                                            onDelete={() =>
                                                handleDeleteRequest(calendar)
                                            }
                                            dict={dict}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setCalendarToDelete(null);
                }}
                onConfirm={deleteCalendar}
                calendarName={calendarToDelete?.name || ''}
                dict={dict}
            />
        </div>
    );
};
