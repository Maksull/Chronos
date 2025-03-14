'use client';

import React, { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { CalendarData, CalendarFormData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';
import { CalendarForm, CalendarItem } from '.';
import { DeleteConfirmationModal } from '..';

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
    const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newCalendarData, setNewCalendarData] = useState<CalendarFormData>({
        name: '',
        description: '',
        color: '#3B82F6',
    });

    // Modal state
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
            const defaultName = `${dict.account.calendars.defaultName || 'New Calendar'} ${
                calendars.length + 1
            }`;
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

    // Handle opening the delete modal
    const handleDeleteRequest = (calendar: CalendarData) => {
        setCalendarToDelete({ id: calendar.id, name: calendar.name });
        setDeleteModalOpen(true);
    };

    // Handle the actual delete operation
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
            // Close the modal regardless of outcome
            setDeleteModalOpen(false);
            setCalendarToDelete(null);
        }
    };

    return (
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
                        <div className="flex gap-2">
                            <button
                                onClick={createEmptyCalendar}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50">
                                <Plus className="h-4 w-4" />
                                {dict.account.calendars.create ||
                                    'Create Calendar'}
                            </button>
                            <button
                                onClick={() =>
                                    setIsCreatingCalendar(!isCreatingCalendar)
                                }
                                className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 ">
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

                    {isCreatingCalendar && (
                        <CalendarForm
                            newCalendarData={newCalendarData}
                            setNewCalendarData={setNewCalendarData}
                            onSubmit={handleCalendarCreate}
                            isLoading={isLoading}
                            dict={dict}
                        />
                    )}

                    <div className="space-y-4">
                        {calendars.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {dict.account.calendars.empty ||
                                    'No calendars found. Create one to get started!'}
                            </div>
                        ) : (
                            calendars.map(calendar => (
                                <CalendarItem
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
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
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
