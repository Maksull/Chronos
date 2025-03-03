// src/components/calendar/CalendarView.tsx
import React from 'react';
import { CalendarData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';
import { Locale } from '@/middleware';
import { DayView, MonthView, WeekView } from '.';

interface CalendarViewProps {
    view: 'month' | 'week' | 'day';
    currentDate: Date;
    calendar: CalendarData | null;
    dict: Dictionary;
    lang: Locale;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    view,
    currentDate,
    calendar,
    dict,
    lang,
}) => {
    if (!calendar) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 dark:text-gray-400">
                    {dict.calendar?.noCalendarSelected ||
                        'No calendar selected'}
                </div>
            </div>
        );
    }

    switch (view) {
        case 'month':
            return <MonthView currentDate={currentDate} dict={dict} />;
        case 'week':
            return (
                <WeekView currentDate={currentDate} dict={dict} lang={lang} />
            );
        case 'day':
            return (
                <DayView currentDate={currentDate} dict={dict} lang={lang} />
            );
        default:
            return <MonthView currentDate={currentDate} dict={dict} />;
    }
};
