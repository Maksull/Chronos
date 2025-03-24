'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDictionary } from '@/contexts';
import {
    CalendarView,
    EventModal,
    ProtectedRoute,
    CalendarEditModal,
    CalendarParticipants,
} from '@/components';
import {
    CalendarData,
    EventData,
    CategoryData,
    ParticipantRole,
} from '@/types/account';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Settings,
    Calendar,
    Users,
    X,
} from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
    const params = useParams();
    const router = useRouter();
    const { dict, lang } = useDictionary();
    const calendarId = params.id as string;
    const [calendar, setCalendar] = useState<CalendarData | null>(null);
    const [, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setLoadingCategories] = useState(false);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<EventData | undefined>(
        undefined,
    );
    const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>(
        'create',
    );
    const [isCalendarEditModalOpen, setIsCalendarEditModalOpen] =
        useState(false);
    const [isParticipantsDrawerOpen, setIsParticipantsDrawerOpen] =
        useState(false);
    const [isUserOwner, setIsUserOwner] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<
        'general' | 'categories' | 'sharing'
    >('general');
    const [currentUserRole, setCurrentUserRole] =
        useState<ParticipantRole | null>(null);
    const [canCreateEvents, setCanCreateEvents] = useState(false);
    const [canManageCalendar, setCanManageCalendar] = useState(false);

    useEffect(() => {
        fetchCalendar();
    }, [calendarId]);

    const fetchCalendar = async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setError(dict.calendar?.notFound || 'Calendar not found');
                    setCalendar(null);
                    setLoading(false);
                    return;
                }
                throw new Error(
                    `Failed to fetch calendar: ${response.status} ${response.statusText}`,
                );
            }

            const data = await response.json();
            if (data.status === 'success') {
                console.log('Calendar data received:', data.data);
                setCalendar(data.data);
                const isOwner = String(data.data.owner.id) === String(userId);
                setIsUserOwner(isOwner);

                if (isOwner) {
                    console.log('Setting owner permissions (ADMIN role)');
                    setCurrentUserRole(ParticipantRole.ADMIN);
                    setCanCreateEvents(true);
                    setCanManageCalendar(true);
                } else {
                    const userParticipation = data.data.participants?.find(
                        (p: { userId: string | number }) =>
                            String(p.userId) === String(userId),
                    );

                    if (userParticipation) {
                        setCurrentUserRole(userParticipation.role);
                        if (userParticipation.role === ParticipantRole.ADMIN) {
                            setCanCreateEvents(true);
                            setCanManageCalendar(true);
                        } else if (
                            userParticipation.role === ParticipantRole.CREATOR
                        ) {
                            setCanCreateEvents(true);
                            setCanManageCalendar(false);
                        } else {
                            setCanCreateEvents(false);
                            setCanManageCalendar(false);
                        }
                    } else {
                        setCurrentUserRole(null);
                        setCanCreateEvents(false);
                        setCanManageCalendar(false);
                    }
                }

                fetchCategories();
            } else {
                setError(data.message || dict.account.errors.generic);
            }
        } catch (error) {
            console.error('Error fetching calendar:', error);
            setError(dict.account.errors.generic);
        } finally {
            setLoading(false);
        }
    };

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
                setCategories(data.data);
            } else {
                console.error('Error fetching categories:', data.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleUpdateRole = async (
        userId: string,
        role: ParticipantRole,
    ): Promise<void> => {
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/participants/${userId}/role`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ role }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to update participant role');
            }

            await fetchCalendar();
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    };

    const handleRemoveParticipant = async (userId: string): Promise<void> => {
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}/participants/${userId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to remove participant');
            }

            await fetchCalendar();
        } catch (error) {
            console.error('Error removing participant:', error);
            throw error;
        }
    };

    const handlePrevious = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (view === 'day') {
            newDate.setDate(newDate.getDate() - 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (view === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleAddEvent = (date?: Date) => {
        setSelectedEvent(undefined);
        setModalMode('create');
        setSelectedDate(date || currentDate);
        setIsEventModalOpen(true);
    };

    const handleEventClick = (event: EventData) => {
        setSelectedEvent(event);
        setModalMode('view');
        setIsEventModalOpen(true);
    };

    const formatDateTitle = () => {
        if (view === 'month') {
            return new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', {
                month: 'long',
                year: 'numeric',
            }).format(currentDate);
        } else if (view === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            const formatter = new Intl.DateTimeFormat(
                lang === 'uk' ? 'uk-UA' : 'en-US',
                {
                    day: 'numeric',
                    month: 'short',
                },
            );
            return `${formatter.format(startOfWeek)} - ${formatter.format(endOfWeek)}`;
        } else {
            return new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            }).format(currentDate);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <div className="text-gray-500 dark:text-gray-400 font-medium">
                                    {dict.account.common.loading}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <Link
                                href={`/${lang}/account`}
                                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium">
                                <ChevronLeft className="h-5 w-5 mr-1" />
                                {dict.calendar?.backToAccount ||
                                    'Back to Account'}
                            </Link>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 flex items-center">
                                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-red-500 dark:text-red-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {dict.calendar?.errorOccurred ||
                                            'An error occurred'}
                                    </h3>
                                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                                        {error}
                                    </p>
                                    <button
                                        onClick={() =>
                                            router.push(`/${lang}/account`)
                                        }
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
                                        {dict.calendar?.returnToAccount ||
                                            'Return to Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={`/${lang}/account`}
                            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium">
                            <ChevronLeft className="h-5 w-5 mr-1" />
                            {dict.calendar?.backToAccount || 'Back to Account'}
                        </Link>
                    </div>

                    {/* Main calendar container */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Calendar Header - Improved for both mobile and desktop */}
                        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                            {/* Calendar Title Section */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center">
                                    <div
                                        className="w-10 h-10 rounded-full mr-3 flex-shrink-0 flex items-center justify-center"
                                        style={{
                                            backgroundColor:
                                                calendar?.color || '#3B82F6',
                                        }}>
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                                            {calendar?.name}
                                        </h1>
                                        {calendar?.description && (
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px] sm:max-w-xs">
                                                {calendar.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* View Selector - Improved touch targets for mobile */}
                                <div className="flex items-center space-x-2 self-end sm:self-auto mt-2 sm:mt-0">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex">
                                        <button
                                            className={`px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                view === 'day'
                                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                                            }`}
                                            onClick={() => setView('day')}>
                                            {dict.calendar?.dayView || 'Day'}
                                        </button>
                                        <button
                                            className={`px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                view === 'week'
                                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                                            }`}
                                            onClick={() => setView('week')}>
                                            {dict.calendar?.weekView || 'Week'}
                                        </button>
                                        <button
                                            className={`px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                view === 'month'
                                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                                            }`}
                                            onClick={() => setView('month')}>
                                            {dict.calendar?.monthView ||
                                                'Month'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Controls */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3 sm:gap-4">
                                {/* Date Navigation */}
                                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex items-center">
                                        <button
                                            onClick={handlePrevious}
                                            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors"
                                            aria-label="Previous">
                                            <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={handleToday}
                                            className="px-3 py-1 text-sm bg-indigo-600 dark:bg-gray-600 text-white dark:text-gray-300 hover:bg-indigo-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm mx-1">
                                            {dict.calendar?.today || 'Today'}
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors"
                                            aria-label="Next">
                                            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white ml-2">
                                        {formatDateTitle()}
                                    </h2>
                                </div>

                                {/* Action Buttons - Improved spacing and sizing */}
                                <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                                    {/* Participants Button */}
                                    <button
                                        onClick={() =>
                                            setIsParticipantsDrawerOpen(true)
                                        }
                                        className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                                        title={
                                            dict.calendar?.participants ||
                                            'Participants'
                                        }>
                                        <Users className="h-5 w-5" />
                                        <span className="sr-only sm:not-sr-only sm:ml-2 text-sm font-medium">
                                            {dict.calendar?.participants ||
                                                'Participants'}
                                        </span>
                                    </button>

                                    {/* Add Event Button with responsive text */}
                                    {canCreateEvents && (
                                        <button
                                            onClick={() => handleAddEvent()}
                                            className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                                            title={
                                                dict.calendar?.addEvent ||
                                                'Add Event'
                                            }>
                                            <Plus className="h-4 w-4 sm:mr-1" />
                                            <span className="hidden sm:inline">
                                                {dict.calendar?.addEvent ||
                                                    'Add Event'}
                                            </span>
                                        </button>
                                    )}

                                    {/* Settings Button */}
                                    {canManageCalendar && (
                                        <button
                                            onClick={() =>
                                                setIsCalendarEditModalOpen(true)
                                            }
                                            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title={
                                                dict.calendar?.settings ||
                                                'Settings'
                                            }>
                                            <Settings className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <CalendarView
                                view={view}
                                currentDate={currentDate}
                                calendar={calendar}
                                dict={dict}
                                lang={lang}
                                onAddEvent={
                                    canCreateEvents ? handleAddEvent : undefined
                                }
                                onEventClick={handleEventClick}
                            />
                        </div>
                    </div>
                </div>

                {/* Participants Sliding Drawer / Panel */}
                {isParticipantsDrawerOpen && calendar && (
                    <div className="fixed inset-0 z-50 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-black bg-opacity-25"
                            onClick={() =>
                                setIsParticipantsDrawerOpen(false)
                            }></div>
                        <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-gray-800 shadow-xl flex flex-col h-full">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {dict.calendar?.participants ||
                                        'Participants'}
                                </h3>
                                <button
                                    onClick={() =>
                                        setIsParticipantsDrawerOpen(false)
                                    }
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto">
                                <CalendarParticipants
                                    calendar={calendar}
                                    dict={dict}
                                    onShowInviteModal={() => {
                                        setIsParticipantsDrawerOpen(false);
                                        setActiveModalTab('sharing');
                                        setIsCalendarEditModalOpen(true);
                                    }}
                                    isOwner={isUserOwner}
                                    currentUserRole={
                                        currentUserRole || undefined
                                    }
                                    onUpdateRole={handleUpdateRole}
                                    onRemoveParticipant={
                                        handleRemoveParticipant
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isEventModalOpen && (
                    <EventModal
                        isOpen={isEventModalOpen}
                        onClose={() => setIsEventModalOpen(false)}
                        calendarId={calendarId}
                        mode={modalMode}
                        date={selectedDate}
                        event={selectedEvent}
                        onEventCreated={fetchCalendar}
                        onEventUpdated={fetchCalendar}
                        onEventDeleted={fetchCalendar}
                        canEdit={
                            isUserOwner ||
                            currentUserRole === ParticipantRole.ADMIN ||
                            (currentUserRole === ParticipantRole.CREATOR &&
                                selectedEvent?.creator?.id ===
                                    localStorage.getItem('userId'))
                        }
                        userRole={currentUserRole || undefined}
                    />
                )}

                {/* Calendar edit modal */}
                {isCalendarEditModalOpen && calendar && (
                    <CalendarEditModal
                        isOpen={isCalendarEditModalOpen}
                        onClose={() => setIsCalendarEditModalOpen(false)}
                        calendar={calendar}
                        onCalendarUpdated={fetchCalendar}
                        onCalendarDeleted={() =>
                            router.push(`/${lang}/account`)
                        }
                        initialTab={activeModalTab}
                        userRole={currentUserRole || undefined}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
