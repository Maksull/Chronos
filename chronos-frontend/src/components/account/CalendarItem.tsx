'use client';

import React from 'react';
import { Calendar, ChevronRight, Eye, EyeOff, Trash2 } from 'lucide-react';
import { CalendarData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';
import { useRouter } from 'next/navigation';

interface CalendarItemProps {
    calendar: CalendarData;
    onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
    onDelete: (calendar: CalendarData) => void;
    dict: Dictionary;
}

export const CalendarItem: React.FC<CalendarItemProps> = ({
    calendar,
    onToggleVisibility,
    onDelete,
    dict,
}) => {
    const router = useRouter();
    const navigateToCalendar = e => {
        if (e.target.closest('button')) return;
        router.push(`/calendar/${calendar.id}`);
    };

    return (
        <div
            className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
            style={{ borderLeft: `4px solid ${calendar.color}` }}
            onClick={navigateToCalendar}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${calendar.color}20` }}>
                        <Calendar
                            className="h-5 w-5"
                            style={{ color: calendar.color }}
                        />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 flex items-center gap-1">
                            {calendar.name}
                            <ChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-indigo-500" />
                        </h3>
                        {calendar.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                {calendar.description}
                            </p>
                        )}
                    </div>
                </div>
                {!calendar.isMain && (
                    <div className="flex items-center gap-2 z-10">
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                onToggleVisibility(
                                    calendar.id,
                                    !calendar.isVisible,
                                );
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {calendar.isVisible ? (
                                <Eye className="h-5 w-5" />
                            ) : (
                                <EyeOff className="h-5 w-5" />
                            )}
                        </button>
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
