'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Dictionary } from '@/lib/dictionary';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { CalendarData, EventData } from '@/types/account';

interface DayViewProps {
    currentDate: Date;
    dict: Dictionary;
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
    const [loading, setLoading] = useState(false);
    const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
    const [expandedHours, setExpandedHours] = useState<Set<number>>(new Set());
    const timeGridRef = useRef<HTMLDivElement>(null);

    // Clone the current date to ensure we're working with a clean time
    const viewDate = new Date(currentDate);

    // Set start and end of the day
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

    // Check if this is today
    const isToday =
        viewDate.getDate() === new Date().getDate() &&
        viewDate.getMonth() === new Date().getMonth() &&
        viewDate.getFullYear() === new Date().getFullYear();

    // Format the date for display
    const formattedDate = viewDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        fetchEvents();
        setExpandedHours(new Set());
    }, [currentDate, calendar?.id]);

    // Effect for current time indicator and auto-scrolling
    useEffect(() => {
        // Calculate and update current time position
        const updateCurrentTimePosition = () => {
            if (!isToday) return;

            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            // Calculate position as percentage of day
            const percentage = ((hours * 60 + minutes) / (24 * 60)) * 100;
            setCurrentTimePosition(percentage);
        };

        // Initial update
        updateCurrentTimePosition();

        // Update every minute
        const intervalId = setInterval(updateCurrentTimePosition, 60000);

        // Scroll to current time (with offset to show a few hours before)
        if (timeGridRef.current && isToday) {
            const now = new Date();
            const currentHour = now.getHours();
            // Find the element for the current hour (or 2 hours before if available)
            const scrollToHour = Math.max(currentHour - 2, 0);
            const hourHeight = 100; // Approximate height of an hour slot in pixels
            timeGridRef.current.scrollTop = scrollToHour * hourHeight;
        }

        return () => clearInterval(intervalId);
    }, [isToday]);

    const fetchEvents = async () => {
        if (!calendar?.id) return;
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:3001/calendars/${calendar.id}/events?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
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

    // Generate time slots for the day (hourly from 0 to 23)
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

    const getEventsForHour = (hour: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getHours() === hour;
        });
    };

    // Toggle expansion of hour slots
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

    // Check if an hour is expanded
    const isHourExpanded = (hour: number) => {
        return expandedHours.has(hour);
    };

    // Calculate event duration in minutes
    const getEventDuration = (event: EventData) => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return Math.max(30, (end.getTime() - start.getTime()) / (1000 * 60)); // Minimum 30 min
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
                                    hover:shadow-sm transition-shadow hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer 
                                    active:bg-indigo-100 dark:active:bg-indigo-900/30"
                                onClick={() => {
                                    if (onAddEvent) {
                                        const newDate = new Date(viewDate);
                                        // Set the hours to the slot's hour (which corresponds to the displayed time)
                                        newDate.setHours(slot.hour, 0, 0, 0);
                                        onAddEvent(newDate);
                                    }
                                }}>
                                {/* Add event button */}
                                <button
                                    onClick={e => {
                                        e.stopPropagation(); // Prevent triggering parent onClick
                                        if (onAddEvent) {
                                            const newDate = new Date(viewDate);
                                            // Set the hours to the slot's hour (which corresponds to the displayed time)
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
                                        hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 
                                        w-6 h-6 flex items-center justify-center rounded-full 
                                        hover:bg-gray-100 dark:hover:bg-gray-700 z-10">
                                    <Plus className="w-4 h-4" />
                                </button>

                                <div className="p-2 mt-4 space-y-2">
                                    {!loading &&
                                        hourEvents
                                            .slice(
                                                0,
                                                isHourExpanded(slot.hour)
                                                    ? hourEvents.length
                                                    : 2,
                                            )
                                            .map(event => {
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
                                                        className="p-2 rounded-md text-sm transition-all hover:shadow-md cursor-pointer" // Add cursor-pointer
                                                        style={{
                                                            backgroundColor: `${event.color}10`,
                                                            borderLeft: `4px solid ${event.color}`,
                                                            color: event.color,
                                                            minHeight: `${Math.min(80, duration / 5)}px`,
                                                        }}
                                                        onClick={e => {
                                                            e.stopPropagation(); // Prevent triggering parent onClick
                                                            if (onEventClick) {
                                                                onEventClick(
                                                                    event,
                                                                ); // Call onEventClick with the event
                                                            }
                                                        }}>
                                                        <div className="font-medium">
                                                            {event.name}
                                                        </div>
                                                        <div className="text-xs opacity-80">
                                                            {startTime} -{' '}
                                                            {endTime}
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
                                                } // Create a larger stop-propagation area
                                            >
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation(); // Prevent triggering parent onClick
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
                                                } // Create a larger stop-propagation area
                                            >
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation(); // Prevent triggering parent onClick
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
