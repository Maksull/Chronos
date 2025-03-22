'use client';
import React, { useEffect, useState } from 'react';
import { Dictionary } from '@/lib/dictionary';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { CalendarData, EventData, CategoryData } from '@/types/account';
import { CategoryFilter } from './CategoryFilter';
import { fetchHolidaysForRegion } from '@/lib/holidays';

interface MonthViewProps {
    currentDate: Date;
    dict: Dictionary;
    onAddEvent?: (date: Date) => void;
    onEventClick?: (event: EventData) => void;
    calendar: CalendarData;
}

interface DayInfo {
    day: number;
    inCurrentMonth: boolean;
    isToday: boolean;
    date: Date;
    rowIndex: number;
}

export const MonthView: React.FC<MonthViewProps> = ({
    currentDate,
    dict,
    onAddEvent,
    calendar,
    onEventClick,
}) => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [holidays, setHolidays] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingHolidays, setLoadingHolidays] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [showHolidays, setShowHolidays] = useState(true);
    const [userRegion, setUserRegion] = useState<string>('');

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
    );
    const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
    );
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - firstDayOfMonth.getDay());
    const endDate = new Date(lastDayOfMonth);
    const daysToAdd = 6 - lastDayOfMonth.getDay();
    endDate.setDate(lastDayOfMonth.getDate() + daysToAdd);
    endDate.setHours(23, 59, 59, 999);

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
                setHolidays(holidaysData);
            } catch (error) {
                console.error('Error fetching holidays:', error);
            } finally {
                setLoadingHolidays(false);
            }
        };

        fetchHolidays();
    }, [userRegion, currentDate.getFullYear()]);

    useEffect(() => {
        fetchCategories();
        fetchEvents();
        setExpandedRows(new Set());
    }, [currentDate, calendar?.id]);

    useEffect(() => {
        fetchEvents();
    }, [selectedCategoryIds]);

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
            let url = `http://localhost:3001/calendars/${calendar.id}/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

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

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
    ).getDate();
    const firstDayOfMonthWeekday = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
    ).getDay();
    const lastDayOfPrevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
    ).getDate();

    const daysArray: DayInfo[] = [];
    const today = new Date();

    // Previous month days
    for (let i = firstDayOfMonthWeekday - 1; i >= 0; i--) {
        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            lastDayOfPrevMonth - i,
        );
        daysArray.push({
            day: lastDayOfPrevMonth - i,
            inCurrentMonth: false,
            isToday: false,
            date,
            rowIndex: 0,
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i,
        );
        const isToday =
            i === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
        daysArray.push({
            day: i,
            inCurrentMonth: true,
            isToday,
            date,
            rowIndex: 0,
        });
    }

    // Next month days
    const remainingDays = 42 - daysArray.length;
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            i,
        );
        daysArray.push({
            day: i,
            inCurrentMonth: false,
            isToday: false,
            date,
            rowIndex: 0,
        });
    }

    // Assign row index
    daysArray.forEach((day, index) => {
        day.rowIndex = Math.floor(index / 7);
    });

    // Group days by row
    const rows = daysArray.reduce(
        (acc, day) => {
            if (!acc[day.rowIndex]) {
                acc[day.rowIndex] = [];
            }
            acc[day.rowIndex].push(day);
            return acc;
        },
        {} as Record<number, DayInfo[]>,
    );

    // Get all events for a specific day, including holidays if enabled
    const getEventsForDay = (date: Date) => {
        // Get regular events
        const dayEvents = events.filter(event => {
            const eventStart = new Date(event.startDate);
            return (
                eventStart.getDate() === date.getDate() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getFullYear() === date.getFullYear()
            );
        });

        // Add holidays if enabled
        const dayHolidays = showHolidays
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
        return [...dayEvents, ...dayHolidays].sort((a, b) => {
            return (
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            );
        });
    };

    const toggleExpandRow = (rowIndex: number) => {
        setExpandedRows(prevExpanded => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(rowIndex)) {
                newExpanded.delete(rowIndex);
            } else {
                newExpanded.add(rowIndex);
            }
            return newExpanded;
        });
    };

    const isRowExpanded = (rowIndex: number) => {
        return expandedRows.has(rowIndex);
    };

    // Check if an event is a holiday
    const isHolidayEvent = (event: EventData) => {
        return event.id.startsWith('holiday-');
    };

    const weekdays = dict.calendar?.weekdays.short || [];

    return (
        <div className="calendar-month-view overflow-y-auto max-h-[calc(100vh-240px)]">
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

            <div className="grid grid-cols-7 mb-2">
                {weekdays.map((day, index) => (
                    <div
                        key={index}
                        className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                    </div>
                ))}
            </div>

            <div className="space-y-1">
                {Object.entries(rows).map(([rowIndexStr, rowDays]) => {
                    const rowIndex = parseInt(rowIndexStr);
                    const isExpanded = isRowExpanded(rowIndex);

                    return (
                        <div
                            key={rowIndex}
                            className={`grid grid-cols-7 gap-1 ${isExpanded ? 'min-h-56' : 'min-h-28'}`}>
                            {rowDays.map((day, dayIndex) => {
                                const dayEvents = getEventsForDay(day.date);
                                const hasMoreEvents = dayEvents.length > 3;

                                return (
                                    <div
                                        key={dayIndex}
                                        onClick={() => {
                                            if (
                                                day.inCurrentMonth &&
                                                onAddEvent
                                            ) {
                                                const newDate = new Date(
                                                    day.date,
                                                );
                                                newDate.setHours(9, 0, 0, 0);
                                                onAddEvent(newDate);
                                            }
                                        }}
                                        className={`
                p-1 rounded-md transition-all group relative
                ${
                    day.inCurrentMonth
                        ? 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-md cursor-pointer active:bg-indigo-100 dark:active:bg-indigo-900/30'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
                }
                ${
                    day.isToday
                        ? 'border-2 border-indigo-500 dark:border-indigo-400'
                        : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
            `}>
                                        <div
                                            className={`flex justify-between items-center p-1 ${day.isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}`}>
                                            <span
                                                className={
                                                    day.isToday
                                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 w-6 h-6 rounded-full flex items-center justify-center'
                                                        : ''
                                                }>
                                                {day.day}
                                            </span>

                                            {day.inCurrentMonth && (
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation(); // Prevent triggering parent onClick
                                                        if (onAddEvent) {
                                                            // Set time to 9:00 AM when creating from month view
                                                            const newDate =
                                                                new Date(
                                                                    day.date,
                                                                );
                                                            newDate.setHours(
                                                                9,
                                                                0,
                                                                0,
                                                                0,
                                                            );
                                                            onAddEvent(newDate);
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 w-5 h-5 flex items-center justify-center">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-1 space-y-1">
                                            {!loading &&
                                                !loadingHolidays &&
                                                dayEvents
                                                    .slice(
                                                        0,
                                                        isExpanded
                                                            ? dayEvents.length
                                                            : 3,
                                                    )
                                                    .map(event => {
                                                        const isHoliday =
                                                            isHolidayEvent(
                                                                event,
                                                            );
                                                        return (
                                                            <div
                                                                key={event.id}
                                                                className={`px-2 py-1 rounded-sm text-xs truncate cursor-pointer hover:brightness-90 ${
                                                                    isHoliday
                                                                        ? 'border-dashed border border-red-300 dark:border-red-700'
                                                                        : ''
                                                                }`}
                                                                style={{
                                                                    backgroundColor: `${event.color}20`,
                                                                    borderLeft: `3px solid ${event.category.color}`,
                                                                    color: event.color,
                                                                }}
                                                                title={
                                                                    isHoliday
                                                                        ? event.description ||
                                                                          ''
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
                                                                    } else if (
                                                                        isHoliday
                                                                    ) {
                                                                        // Maybe show holiday details in a tooltip or modal
                                                                        console.log(
                                                                            'Holiday clicked:',
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
                                                                    <span>
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
                                                                    </span>
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
                                                            toggleExpandRow(
                                                                rowIndex,
                                                            );
                                                        }}
                                                        className="w-full py-1 px-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                        <ChevronDown className="w-3 h-3 mr-1" />
                                                        +{dayEvents.length - 3}{' '}
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
                                                            toggleExpandRow(
                                                                rowIndex,
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
            </div>
        </div>
    );
};
