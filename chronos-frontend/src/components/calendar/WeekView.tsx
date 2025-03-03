import React from 'react';
import { Dictionary } from '@/lib/dictionary';
import { Locale } from '@/middleware';
import { Clock, Plus } from 'lucide-react';

interface WeekViewProps {
    currentDate: Date;
    dict: Dictionary;
    lang: Locale;
}

interface DayInfo {
    date: Date;
    isToday: boolean;
}

export const WeekView: React.FC<WeekViewProps> = ({
    currentDate,
    dict,
    lang,
}) => {
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);

    const daysArray: DayInfo[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const isToday =
            currentDay.getDate() === today.getDate() &&
            currentDay.getMonth() === today.getMonth() &&
            currentDay.getFullYear() === today.getFullYear();
        daysArray.push({
            date: currentDay,
            isToday,
        });
    }

    const hours = [];
    for (let i = 5; i < 24; i++) {
        hours.push(i);
    }

    const weekdays = dict.calendar?.weekdays.full || [];

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
    const currentTimePosition =
        (currentHour - 5) * 64 + (currentMinute * 64) / 60;

    return (
        <div className="calendar-week-view overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)]">
            <div className="min-w-[800px]">
                <div className="grid grid-cols-8 mb-2 sticky top-0 z-10 bg-white dark:bg-gray-800">
                    <div className="border-b border-gray-200 dark:border-gray-700 p-2"></div>
                    {daysArray.map((day, index) => (
                        <div
                            key={index}
                            className={`
                text-center py-3 border-b border-gray-200 dark:border-gray-700
                ${day.isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}
              `}>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {weekdays[day.date.getDay()]?.substring(0, 3)}
                            </div>
                            <div
                                className={`
                  text-2xl mt-1
                  ${day.isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-700 dark:text-gray-300'}
                `}>
                                {day.date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    {daysArray.some(day => day.isToday) && (
                        <div
                            className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                            style={{ top: `${currentTimePosition}px` }}>
                            <div className="absolute left-20 -top-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <Clock className="h-3 w-3 text-white" />
                            </div>
                            <div className="w-full border-t-2 border-red-500"></div>
                        </div>
                    )}

                    <div>
                        {hours.map((hour, hourIndex) => (
                            <div
                                key={hourIndex}
                                className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 group hover:bg-gray-50 dark:hover:bg-gray-750">
                                <div className="p-2 text-right pr-4 text-sm text-gray-500 dark:text-gray-400 pt-3 group-hover:font-medium">
                                    {formatHour(hour)}
                                </div>
                                {daysArray.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`
                      border-l border-gray-200 dark:border-gray-700 h-16 relative group transition-colors
                      ${day.isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}
                    `}>
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex justify-center items-center">
                                            <button className="p-1 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:shadow">
                                                <Plus className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
