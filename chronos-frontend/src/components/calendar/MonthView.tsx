import React from 'react';
import { Dictionary } from '@/lib/dictionary';
import { Plus } from 'lucide-react';

interface MonthViewProps {
    currentDate: Date;
    dict: Dictionary;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, dict }) => {
    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
    ).getDay();

    const lastDayOfPrevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
    ).getDate();

    const daysArray = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        daysArray.push({
            day: lastDayOfPrevMonth - i,
            inCurrentMonth: false,
            isToday: false,
        });
    }

    const today = new Date();

    for (let i = 1; i <= daysInMonth; i++) {
        const isToday =
            i === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

        daysArray.push({
            day: i,
            inCurrentMonth: true,
            isToday,
        });
    }

    const remainingDays = 42 - daysArray.length;

    for (let i = 1; i <= remainingDays; i++) {
        daysArray.push({
            day: i,
            inCurrentMonth: false,
            isToday: false,
        });
    }

    const weekdays = dict.calendar?.weekdays.short || [];

    return (
        <div className="calendar-month-view overflow-y-auto max-h-[calc(100vh-240px)]">
            <div className="grid grid-cols-7 mb-2">
                {weekdays.map((day, index) => (
                    <div
                        key={index}
                        className="text-center py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysArray.map((day, index) => (
                    <div
                        key={index}
                        className={`
              min-h-28 p-1 border dark:border-gray-700 rounded-md transition-all
              ${
                  day.inCurrentMonth
                      ? 'bg-white dark:bg-gray-800 hover:shadow-md'
                      : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
              }
              ${
                  day.isToday
                      ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}>
                        <div
                            className={`
                flex justify-between items-center p-1
                ${day.isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}
              `}>
                            <span
                                className={
                                    day.isToday
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 w-6 h-6 rounded-full flex items-center justify-center'
                                        : ''
                                }>
                                {day.day}
                            </span>
                            {day.inCurrentMonth && (
                                <button className="opacity-0 hover:opacity-100 text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 w-5 h-5 flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="mt-1 space-y-1">{}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
