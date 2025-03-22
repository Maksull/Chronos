'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Dictionary } from '@/lib/dictionary';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { CalendarData, EventData, CategoryData } from '@/types/account';
import { CategoryFilter } from './CategoryFilter';
import { Locale } from '@/middleware';
import { fetchHolidaysForRegion } from '@/lib/holidays';

interface DayViewProps {
    currentDate: Date;
    dict: Dictionary;
    lang: Locale;
    onAddEvent?: (date: Date) => void;
    onEventClick?: (event: EventData) => void;
    calendar: CalendarData;
}

interface TimeSlot {
    hour: number;
    minute: number;
    label: string;
}

export const DayView: React.FC<DayViewProps> = ({
    currentDate,
    dict,
    calendar,
    onAddEvent,
    onEventClick,
}) => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [holidays, setHolidays] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingHolidays, setLoadingHolidays] = useState(false);
    const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
    const [expandedHours, setExpandedHours] = useState<Set<number>>(new Set());
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [showHolidays, setShowHolidays] = useState(true);
    const [userRegion, setUserRegion] = useState<string>('');

    const timeGridRef = useRef<HTMLDivElement>(null);

    const viewDate = new Date(currentDate);
    const startOfDay = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        viewDate.getDate(),
        0,
        0,
        0,
        0,
    );
    const endOfDay = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        viewDate.getDate(),
        23,
        59,
        59,
        999,
    );

    const isToday =
        viewDate.getDate() === new Date().getDate() &&
        viewDate.getMonth() === new Date().getMonth() &&
        viewDate.getFullYear() === new Date().getFullYear();

    const formattedDate = viewDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Fetch user profile to get region
    useEffect(() => {
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

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success' && data.data.region) {
                        setUserRegion(data.data.region);
                    }
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    // Fetch holidays when region or current date changes
    useEffect(() => {
        const fetchHolidays = async () => {
            if (!userRegion) return;

            setLoadingHolidays(true);
            try {
                const year = currentDate.getFullYear();
                const holidaysData = await fetchHolidaysForRegion(
                    userRegion,
                    year,
                );

                // Filter only holidays for the current day view
                const todayHolidays = holidaysData.filter(holiday => {
                    const holidayDate = new Date(holiday.startDate);
                    return (
                        holidayDate.getDate() === startOfDay.getDate() &&
                        holidayDate.getMonth() === startOfDay.getMonth() &&
                        holidayDate.getFullYear() === startOfDay.getFullYear()
                    );
                });

                setHolidays(todayHolidays);
            } catch (error) {
                console.error('Error fetching holidays:', error);
            } finally {
                setLoadingHolidays(false);
            }
        };

        if (userRegion) {
            fetchHolidays();
        }
    }, [
        userRegion,
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
    ]);

    useEffect(() => {
        fetchCategories();
        fetchEvents();
        setExpandedHours(new Set());
    }, [currentDate, calendar?.id]);

    useEffect(() => {
        fetchEvents();
    }, [selectedCategoryIds]);

    useEffect(() => {
        const updateCurrentTimePosition = () => {
            if (!isToday) return;

            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const percentage = ((hours * 60 + minutes) / (24 * 60)) * 100;
            setCurrentTimePosition(percentage);
        };

        updateCurrentTimePosition();
        const intervalId = setInterval(updateCurrentTimePosition, 60000);

        if (timeGridRef.current && isToday) {
            const now = new Date();
            const currentHour = now.getHours();
            const scrollToHour = Math.max(currentHour - 2, 0);
            const hourHeight = 100;
            timeGridRef.current.scrollTop = scrollToHour * hourHeight;
        }

        return () => clearInterval(intervalId);
    }, [isToday]);

    const fetchCategories = async () => {
        if (!calendar?.id) return;
        try {
            const response = await fetch(
                `http://localhost:3001/calendars/${calendar.id}/categories`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setCategories(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchEvents = async () => {
        if (!calendar?.id) return;
        try {
            setLoading(true);
            let url = `http://localhost:3001/calendars/${calendar.id}/events?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`;

            if (selectedCategoryIds.length > 0) {
                selectedCategoryIds.forEach(categoryId => {
                    url += `&categoryId=${categoryId}`;
                });
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setEvents(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryIds: string[]) => {
        setSelectedCategoryIds(categoryIds);
    };

    const toggleHolidaysDisplay = () => {
        setShowHolidays(!showHolidays);
    };

    const getTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        for (let hour = 0; hour < 24; hour++) {
            slots.push({
                hour,
                minute: 0,
                label: new Date(2000, 0, 1, hour, 0).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            });
        }
        return slots;
    };

    const timeSlots = getTimeSlots();

    // Get all events for a specific hour, including holidays if enabled
    const getEventsForHour = (hour: number) => {
        // Get regular events
        const hourEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getHours() === hour;
        });

        // Add holidays if enabled (assign to 9 AM by convention)
        const hourHolidays = showHolidays && hour === 9 ? holidays : [];

        // Combine and sort by time
        return [...hourEvents, ...hourHolidays].sort((a, b) => {
            return (
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            );
        });
    };

    const toggleExpandHour = (hour: number) => {
        setExpandedHours(prevExpanded => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(hour)) {
                newExpanded.delete(hour);
            } else {
                newExpanded.add(hour);
            }
            return newExpanded;
        });
    };

    const isHourExpanded = (hour: number) => {
        return expandedHours.has(hour);
    };

    const getEventDuration = (event: EventData) => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return Math.max(30, (end.getTime() - start.getTime()) / (1000 * 60));
    };

    // Check if an event is a holiday
    const isHolidayEvent = (event: EventData) => {
        return event.id.startsWith('holiday-');
    };

    return (
        <div
            className="calendar-day-view overflow-y-auto max-h-[calc(100vh-240px)]"
            ref={timeGridRef}>
            <div className="border-b dark:border-gray-700 mb-4 pb-2">
                <h2
                    className={`text-xl font-semibold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                    {formattedDate}
                    {isToday && (
                        <span className="ml-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                            Today
                        </span>
                    )}
                </h2>
            </div>

            <div className="flex justify-between items-center mb-4">
                <CategoryFilter
                    categories={categories}
                    selectedCategoryIds={selectedCategoryIds}
                    onCategoryChange={handleCategoryChange}
                />

                <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer mr-2">
                        <input
                            type="checkbox"
                            checked={showHolidays}
                            onChange={toggleHolidaysDisplay}
                            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {dict.calendar?.showHolidays || 'Show Holidays'}
                        </span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-2 relative">
                {isToday && (
                    <div
                        className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                        style={{ top: `${currentTimePosition}%` }}>
                        <div className="min-w-12 h-5 bg-red-500 rounded-r-full flex items-center justify-center px-1">
                            <span className="text-white text-xs font-bold whitespace-nowrap">
                                {new Date().toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <div className="flex-grow h-0.5 bg-red-500"></div>
                    </div>
                )}

                {timeSlots.map((slot, index) => {
                    const hourEvents = getEventsForHour(slot.hour);
                    return (
                        <React.Fragment key={index}>
                            <div className="text-xs text-gray-500 dark:text-gray-400 pr-4 text-right py-2 sticky left-0">
                                {slot.label}
                            </div>

                            {/* Event container */}
                            <div
                                className="relative border dark:border-gray-700 rounded-md min-h-24 bg-white dark:bg-gray-800 
                                hover:shadow-sm transition-shadow hover:bg-indigo-50 dark:hover:bg-indigo-900/20 
                                cursor-pointer active:bg-indigo-100 dark:active:bg-indigo-900/30"
                                onClick={() => {
                                    if (onAddEvent) {
                                        const newDate = new Date(viewDate);
                                        newDate.setHours(slot.hour, 0, 0, 0);
                                        onAddEvent(newDate);
                                    }
                                }}>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        if (onAddEvent) {
                                            const newDate = new Date(viewDate);
                                            newDate.setHours(
                                                slot.hour,
                                                0,
                                                0,
                                                0,
                                            );
                                            onAddEvent(newDate);
                                        }
                                    }}
                                    className="absolute top-1 right-1 opacity-0 hover:opacity-100 text-gray-400 
                                    hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 w-6 h-6
                                    flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 z-10">
                                    <Plus className="w-4 h-4" />
                                </button>

                                <div className="p-2 mt-4 space-y-2">
                                    {!loading &&
                                        !loadingHolidays &&
                                        hourEvents.map(event => {
                                            const isHoliday =
                                                isHolidayEvent(event);
                                            const duration =
                                                getEventDuration(event);
                                            const startTime = new Date(
                                                event.startDate,
                                            ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            });
                                            const endTime = new Date(
                                                event.endDate,
                                            ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            });

                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`p-2 rounded-md text-sm transition-all hover:shadow-md cursor-pointer
                                                    ${isHoliday ? 'border-dashed border border-red-300 dark:border-red-700' : ''}`}
                                                    style={{
                                                        backgroundColor: `${event.color}10`,
                                                        borderLeft: `4px solid ${event.category.color}`,
                                                        color: event.color,
                                                        minHeight: `${Math.min(80, duration / 5)}px`,
                                                    }}
                                                    title={
                                                        isHoliday
                                                            ? event.description ||
                                                              '' // Convert null to empty string
                                                            : `${event.name}${event.description ? `\n${event.description}` : ''}`
                                                    }
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        if (
                                                            onEventClick &&
                                                            !isHoliday
                                                        ) {
                                                            onEventClick(event);
                                                        }
                                                    }}>
                                                    <div className="font-medium">
                                                        {isHoliday ? (
                                                            <span>
                                                                🎉 {event.name}
                                                            </span>
                                                        ) : (
                                                            event.name
                                                        )}
                                                    </div>
                                                    <div className="text-xs opacity-80">
                                                        {isHoliday
                                                            ? 'All Day'
                                                            : `${startTime} - ${endTime}`}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {hourEvents.length > 2 &&
                                        !isHourExpanded(slot.hour) && (
                                            <div
                                                className="mx-1 mb-1 mt-2"
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        toggleExpandHour(
                                                            slot.hour,
                                                        );
                                                    }}
                                                    className="w-full py-2 rounded bg-gray-100 dark:bg-gray-700 
                                                hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center 
                                                text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 
                                                dark:hover:text-indigo-400 transition-colors">
                                                    <ChevronDown className="w-3 h-3 mr-1" />
                                                    Show {hourEvents.length - 2}{' '}
                                                    more
                                                </button>
                                            </div>
                                        )}

                                    {hourEvents.length > 2 &&
                                        isHourExpanded(slot.hour) && (
                                            <div
                                                className="mx-1 mb-1 mt-2"
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        toggleExpandHour(
                                                            slot.hour,
                                                        );
                                                    }}
                                                    className="w-full py-2 rounded bg-gray-100 dark:bg-gray-700 
                                                hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center 
                                                text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 
                                                dark:hover:text-indigo-400 transition-colors">
                                                    <ChevronUp className="w-3 h-3 mr-1" />
                                                    Show less
                                                </button>
                                            </div>
                                        )}

                                    {hourEvents.length === 0 && (
                                        <div className="h-4"></div>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
