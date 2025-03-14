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
} from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
    const params = useParams();
    const router = useRouter();
    const { dict, lang } = useDictionary();
    const calendarId = params.id as string;

    const [calendar, setCalendar] = useState<CalendarData | null>(null);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(false);
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
    const [showParticipants, setShowParticipants] = useState(false);
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
            // Get the user ID from localStorage for permission checks
            const userId = localStorage.getItem('userId');

            // Fetch calendar data
            const response = await fetch(
                `http://localhost:3001/calendars/${calendarId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            // Handle response errors
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

            // Parse response data
            const data = await response.json();

            if (data.status === 'success') {
                console.log('Calendar data received:', data.data);
                setCalendar(data.data);

                // Check if user is the owner - convert both to strings to avoid type mismatches
                const isOwner = String(data.data.owner.id) === String(userId);

                setIsUserOwner(isOwner);

                // Determine permissions based on role
                if (isOwner) {
                    // Owner has all permissions
                    console.log('Setting owner permissions (ADMIN role)');
                    setCurrentUserRole(ParticipantRole.ADMIN);
                    setCanCreateEvents(true);
                    setCanManageCalendar(true);
                } else {
                    // Check if user is a participant
                    const userParticipation = data.data.participants?.find(
                        p => String(p.userId) === String(userId),
                    );

                    if (userParticipation) {
                        setCurrentUserRole(userParticipation.role);

                        // Set permissions based on role
                        if (userParticipation.role === ParticipantRole.ADMIN) {
                            setCanCreateEvents(true);
                            setCanManageCalendar(true);
                        } else if (
                            userParticipation.role === ParticipantRole.CREATOR
                        ) {
                            setCanCreateEvents(true);
                            setCanManageCalendar(false);
                        } else {
                            // READER role or any other role
                            setCanCreateEvents(false);
                            setCanManageCalendar(false);
                        }
                    } else {
                        // User is not a participant
                        setCurrentUserRole(null);
                        setCanCreateEvents(false);
                        setCanManageCalendar(false);
                    }
                }

                // After setting permissions, fetch categories
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

    // Role management functions
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

            // Refresh calendar data
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

            // Refresh calendar data
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

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Side panel - Only visible on large screens */}
                        <div className="hidden lg:block">
                            {/* Participants section */}
                            {calendar && (
                                <CalendarParticipants
                                    calendar={calendar}
                                    dict={dict}
                                    onShowInviteModal={() => {
                                        setShowParticipants(false);
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
                            )}
                        </div>

                        {/* Main calendar section */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-full mr-3 flex-shrink-0 flex items-center justify-center"
                                                style={{
                                                    backgroundColor:
                                                        calendar?.color ||
                                                        '#3B82F6',
                                                }}>
                                                <Calendar className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {calendar?.name}
                                                </h1>
                                                {calendar?.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {calendar.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                                            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
                                                <button
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                        view === 'day'
                                                            ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                                                    }`}
                                                    onClick={() =>
                                                        setView('day')
                                                    }>
                                                    {dict.calendar?.dayView ||
                                                        'Day'}
                                                </button>
                                                <button
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                        view === 'week'
                                                            ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                                                    }`}
                                                    onClick={() =>
                                                        setView('week')
                                                    }>
                                                    {dict.calendar?.weekView ||
                                                        'Week'}
                                                </button>
                                                <button
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                        view === 'month'
                                                            ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                                                    }`}
                                                    onClick={() =>
                                                        setView('month')
                                                    }>
                                                    {dict.calendar?.monthView ||
                                                        'Month'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex items-center">
                                                <button
                                                    onClick={handlePrevious}
                                                    className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors">
                                                    <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                </button>
                                                <button
                                                    onClick={handleToday}
                                                    className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm mx-1">
                                                    {dict.calendar?.today ||
                                                        'Today'}
                                                </button>
                                                <button
                                                    onClick={handleNext}
                                                    className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors">
                                                    <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                </button>
                                            </div>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                                                {formatDateTitle()}
                                            </h2>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {/* Participants button - mobile only */}
                                            <button
                                                onClick={() =>
                                                    setShowParticipants(
                                                        !showParticipants,
                                                    )
                                                }
                                                className="lg:hidden p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title={
                                                    dict.calendar
                                                        ?.participants ||
                                                    'Participants'
                                                }>
                                                <Users className="h-5 w-5" />
                                            </button>

                                            {/* Only show Add Event button if user has CREATE permissions */}
                                            {canCreateEvents && (
                                                <button
                                                    onClick={() =>
                                                        handleAddEvent()
                                                    }
                                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                                                    title={
                                                        dict.calendar
                                                            ?.addEvent ||
                                                        'Add Event'
                                                    }>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    {dict.calendar?.addEvent ||
                                                        'Add Event'}
                                                </button>
                                            )}

                                            {/* Only show Settings button if user can manage calendar */}
                                            {canManageCalendar && (
                                                <button
                                                    onClick={() =>
                                                        setIsCalendarEditModalOpen(
                                                            true,
                                                        )
                                                    }
                                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    title={
                                                        dict.calendar
                                                            ?.settings ||
                                                        'Settings'
                                                    }>
                                                    <Settings className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Participants panel - only visible when toggled */}
                                {showParticipants && (
                                    <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                                        {calendar && (
                                            <CalendarParticipants
                                                calendar={calendar}
                                                dict={dict}
                                                onShowInviteModal={() => {
                                                    setShowParticipants(false);
                                                    setActiveModalTab(
                                                        'sharing',
                                                    );
                                                    setIsCalendarEditModalOpen(
                                                        true,
                                                    );
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
                                        )}
                                    </div>
                                )}

                                <div className="p-4">
                                    <CalendarView
                                        view={view}
                                        currentDate={currentDate}
                                        calendar={calendar}
                                        dict={dict}
                                        lang={lang}
                                        onAddEvent={
                                            canCreateEvents
                                                ? handleAddEvent
                                                : undefined
                                        }
                                        onEventClick={handleEventClick}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
