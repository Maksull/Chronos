'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Dictionary } from '@/lib/dictionary';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { CalendarData, EventData, CategoryData } from '@/types/account';
import { CategoryFilter } from './CategoryFilter';
import { Locale } from '@/middleware';
import { fetchHolidaysForRegion } from '@/lib/holidays';

interface WeekViewProps {
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

interface DayColumn {
    date: Date;
    isToday: boolean;
    dayNumber: number;
    dayName: string;
}

export const WeekView: React.FC<WeekViewProps> = ({
    currentDate,
    dict,
    lang,
    calendar,
    onAddEvent,
    onEventClick,
}) => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [holidays, setHolidays] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingHolidays, setLoadingHolidays] = useState(false);
    const [expandedHours, setExpandedHours] = useState<Set<number>>(new Set());
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [showHolidays, setShowHolidays] = useState(true);
    const [userRegion, setUserRegion] = useState<string>('');

    const timeGridRef = useRef<HTMLDivElement>(null);
    const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);

    const getWeekDates = () => {
        const date = new Date(currentDate);
        const day = date.getDay();
        const diff = date.getDate() - day;

        const firstDayOfWeek = new Date(date.setDate(diff));
        firstDayOfWeek.setHours(0, 0, 0, 0);

        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23, 59, 59, 999);

        return { firstDayOfWeek, lastDayOfWeek };
    };

    // Calculate week dates once, not on every render
    const { firstDayOfWeek, lastDayOfWeek } = React.useMemo(
        () => getWeekDates(),
        [
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
        ],
    );

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

                // Filter only holidays for the current week view
                const weekHolidays = holidaysData.filter(holiday => {
                    const holidayDate = new Date(holiday.startDate);
                    const firstDay = new Date(firstDayOfWeek);
                    const lastDay = new Date(lastDayOfWeek);

                    return holidayDate >= firstDay && holidayDate <= lastDay;
                });

                setHolidays(weekHolidays);
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
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const percentage = ((hours * 60 + minutes) / (24 * 60)) * 100;
            setCurrentTimePosition(percentage);
        };

        updateCurrentTimePosition();
        const intervalId = setInterval(updateCurrentTimePosition, 60000);

        if (timeGridRef.current) {
            const now = new Date();
            const currentHour = now.getHours();
            const scrollToHour = Math.max(currentHour - 2, 0);
            const hourHeight = 72;
            timeGridRef.current.scrollTop = scrollToHour * hourHeight;
        }

        return () => clearInterval(intervalId);
    }, []);

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
            let url = `http://localhost:3001/calendars/${calendar.id}/events?startDate=${firstDayOfWeek.toISOString()}&endDate=${lastDayOfWeek.toISOString()}`;

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

    const getDayColumns = (): DayColumn[] => {
        const columns: DayColumn[] = [];
        const today = new Date();
        const weekdays = dict.calendar?.weekdays.short || [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(firstDayOfWeek);
            date.setDate(firstDayOfWeek.getDate() + i);

            const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

            columns.push({
                date,
                isToday,
                dayNumber: date.getDate(),
                dayName: weekdays[i] || '',
            });
        }

        return columns;
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

    const dayColumns = getDayColumns();
    const timeSlots = getTimeSlots();

    // Get all events for a specific day and hour, including holidays if enabled
    const getEventsForDayAndHour = (date: Date, hour: number) => {
        // Get regular events
        const dayHourEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            return (
                eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear() &&
                eventDate.getHours() === hour
            );
        });

        // Add holidays if enabled (assign to 9 AM by convention)
        const dayHourHolidays =
            showHolidays && hour === 9
                ? holidays.filter(holiday => {
                      const holidayDate = new Date(holiday.startDate);
                      return (
                          holidayDate.getDate() === date.getDate() &&
                          holidayDate.getMonth() === date.getMonth() &&
                          holidayDate.getFullYear() === date.getFullYear()
                      );
                  })
                : [];

        // Combine and sort by time
        return [...dayHourEvents, ...dayHourHolidays].sort((a, b) => {
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

    // Check if an event is a holiday
    const isHolidayEvent = (event: EventData) => {
        return event.id.startsWith('holiday-');
    };

    return (
        <div
            className="calendar-week-view overflow-y-auto max-h-[calc(100vh-240px)]"
            ref={timeGridRef}>
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

            <div className="grid grid-cols-8 mb-2 border-b dark:border-gray-700">
                <div className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">
                    Time
                </div>

                {dayColumns.map((day, index) => (
                    <div
                        key={index}
                        className={`p-3 text-center border-r dark:border-gray-700 last:border-r-0 ${
                            day.isToday
                                ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                : ''
                        }`}>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {day.dayName}
                        </div>
                        <div
                            className={`text-lg ${day.isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}`}>
                            {day.dayNumber}
                        </div>
                    </div>
                ))}
            </div>

            {/* Time slots and events */}
            <div className="space-y-1 relative">
                {timeSlots.map((timeSlot, timeIndex) => {
                    const isExpanded = isHourExpanded(timeSlot.hour);
                    const hourHasEvents = dayColumns.some(
                        day =>
                            getEventsForDayAndHour(day.date, timeSlot.hour)
                                .length > 0,
                    );

                    return (
                        <div
                            key={timeIndex}
                            className={`grid grid-cols-8 gap-1 ${hourHasEvents && isExpanded ? 'min-h-36' : 'min-h-16'}`}>
                            {/* Time column */}
                            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r dark:border-gray-700 flex items-start justify-end pr-3">
                                {timeSlot.label}
                            </div>

                            {/* Day columns */}
                            {dayColumns.map((day, dayIndex) => {
                                const dayHourEvents = getEventsForDayAndHour(
                                    day.date,
                                    timeSlot.hour,
                                );
                                const hasMoreEvents = dayHourEvents.length > 2;

                                return (
                                    <div
                                        key={dayIndex}
                                        onClick={() => {
                                            if (onAddEvent) {
                                                const newDate = new Date(
                                                    day.date,
                                                );
                                                newDate.setHours(
                                                    timeSlot.hour,
                                                    0,
                                                    0,
                                                    0,
                                                );
                                                onAddEvent(newDate);
                                            }
                                        }}
                                        className={`
                p-1 border dark:border-gray-700 rounded-md transition-all relative group
                ${day.isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-white dark:bg-gray-800'}
                hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-md cursor-pointer 
                active:bg-indigo-100 dark:active:bg-indigo-900/30
            `}>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (onAddEvent) {
                                                    const newDate = new Date(
                                                        day.date,
                                                    );
                                                    newDate.setHours(
                                                        timeSlot.hour,
                                                        0,
                                                        0,
                                                        0,
                                                    );
                                                    onAddEvent(newDate);
                                                }
                                            }}
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 w-5 h-5 flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </button>

                                        {/*Events*/}
                                        <div className="mt-4 space-y-1">
                                            {!loading &&
                                                !loadingHolidays &&
                                                dayHourEvents
                                                    .slice(
                                                        0,
                                                        isExpanded
                                                            ? dayHourEvents.length
                                                            : 2,
                                                    )
                                                    .map(event => {
                                                        const isHoliday =
                                                            isHolidayEvent(
                                                                event,
                                                            );
                                                        return (
                                                            <div
                                                                key={event.id}
                                                                className={`px-2 py-1 rounded-sm text-xs truncate cursor-pointer hover:brightness-90
                                        ${isHoliday ? 'border-dashed border border-red-300 dark:border-red-700' : ''}`}
                                                                style={{
                                                                    backgroundColor: `${event.color}20`,
                                                                    borderLeft: `3px solid ${event.color}`,
                                                                    color: event.color,
                                                                }}
                                                                title={
                                                                    isHoliday
                                                                        ? event.description ||
                                                                          '' // Convert null to empty string
                                                                        : `${event.name}${event.description ? `\n${event.description}` : ''}`
                                                                }
                                                                onClick={e => {
                                                                    e.stopPropagation(); // Prevent triggering parent onClick
                                                                    if (
                                                                        onEventClick &&
                                                                        !isHoliday
                                                                    ) {
                                                                        onEventClick(
                                                                            event,
                                                                        );
                                                                    }
                                                                }}>
                                                                {isHoliday ? (
                                                                    <span>
                                                                        🎉{' '}
                                                                        {
                                                                            event.name
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        {new Date(
                                                                            event.startDate,
                                                                        ).toLocaleTimeString(
                                                                            [],
                                                                            {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            },
                                                                        )}{' '}
                                                                        -{' '}
                                                                        {
                                                                            event.name
                                                                        }
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                            {hasMoreEvents && !isExpanded && (
                                                <div
                                                    className="mt-2 p-1 -mx-1 text-center"
                                                    onClick={e =>
                                                        e.stopPropagation()
                                                    }>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            toggleExpandHour(
                                                                timeSlot.hour,
                                                            );
                                                        }}
                                                        className="w-full py-1 px-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        <ChevronDown className="w-3 h-3 mr-1" />
                                                        +
                                                        {dayHourEvents.length -
                                                            2}{' '}
                                                        more
                                                    </button>
                                                </div>
                                            )}

                                            {hasMoreEvents && isExpanded && (
                                                <div
                                                    className="mt-2 p-1 -mx-1 text-center"
                                                    onClick={e =>
                                                        e.stopPropagation()
                                                    }>
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            toggleExpandHour(
                                                                timeSlot.hour,
                                                            );
                                                        }}
                                                        className="w-full py-1 px-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        <ChevronUp className="w-3 h-3 mr-1" />
                                                        Show less
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                {/* Current time indicator */}
                {firstDayOfWeek.getDate() <= new Date().getDate() &&
                    new Date().getDate() <= lastDayOfWeek.getDate() && (
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
            </div>
        </div>
    );
};
