import React from 'react';
import { Dictionary } from '@/lib/dictionary';
import { Locale } from '@/middleware';
import { Clock } from 'lucide-react';

interface DayViewProps {
    currentDate: Date;
    dict: Dictionary;
    lang: Locale;
}

export const DayView: React.FC<DayViewProps> = ({
    currentDate,
    dict,
    lang,
}) => {
    const today = new Date();
    const isToday =
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

    const hours = [];
    for (let i = 5; i < 24; i++) {
        hours.push(i);
    }

    const formatHour = (hour: number) => {
        if (lang === 'uk') {
            return (dict.calendar?.timeFormat.hours24 || '{hour}:00').replace(
                '{hour}',
                hour.toString(),
            );
        } else {
            const period =
                hour >= 12
                    ? dict.calendar?.timeFormat.pm || 'PM'
                    : dict.calendar?.timeFormat.am || 'AM';
            const displayHour = hour % 12 === 0 ? 12 : hour % 12;
            return (dict.calendar?.timeFormat.hours12 || '{hour} {period}')
                .replace('{hour}', displayHour.toString())
                .replace('{period}', period);
        }
    };

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimePosition = isToday
        ? (currentHour - 5) * 64 + (currentMinute * 64) / 60
        : -1;

    return (
        <div className="calendar-day-view overflow-y-auto max-h-[calc(100vh-240px)]">
            <div className="flex flex-col">
                <div
                    className={`
            text-center py-4 mb-4 border-b border-gray-200 dark:border-gray-700
            ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
          `}>
                    <div
                        className={`
              text-xl font-medium
              ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}
            `}>
                        {new Intl.DateTimeFormat(
                            lang === 'uk' ? 'uk-UA' : 'en-US',
                            {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            },
                        ).format(currentDate)}
                    </div>
                </div>
                <div className="relative">
                    {isToday && (
                        <div
                            className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                            style={{ top: `${currentTimePosition}px` }}>
                            <div className="absolute -left-2 -top-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <Clock className="h-3 w-3 text-white" />
                            </div>
                            <div className="w-full border-t-2 border-red-500"></div>
                        </div>
                    )}
                    {hours.map((hour, hourIndex) => (
                        <div
                            key={hourIndex}
                            className="flex border-b border-gray-200 dark:border-gray-700 group hover:bg-gray-50 dark:hover:bg-gray-750">
                            <div className="w-20 p-2 text-right pr-4 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 pt-3 group-hover:font-medium">
                                {formatHour(hour)}
                            </div>
                            <div className="flex-grow h-16 border-l border-gray-200 dark:border-gray-700 relative">
                                {}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
