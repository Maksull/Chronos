// src/components/account/CalendarItem.tsx
import React from 'react';
import { Eye, EyeOff, Globe, Trash2 } from 'lucide-react';
import { CalendarData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';
import Link from 'next/link';

interface CalendarItemProps {
    calendar: CalendarData;
    onToggleVisibility: (id: string, isVisible: boolean) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    dict: Dictionary;
}

export const CalendarItem: React.FC<CalendarItemProps> = ({
    calendar,
    onToggleVisibility,
    onDelete,
    dict,
}) => {
    return (
        <div
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl transition-all hover:shadow-sm"
            style={{
                borderLeft: `4px solid ${calendar.color}`,
            }}>
            <Link
                href={`/calendar/${calendar.id}`}
                className="flex-1 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2">
                    {calendar.isHoliday && (
                        <Globe className="h-4 w-4 text-gray-400" />
                    )}
                    <h3 className="font-medium text-gray-900 dark:text-white">
                        {calendar.name}
                    </h3>
                    {calendar.isMain && (
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                            {dict.account.calendars.main}
                        </span>
                    )}
                    {calendar.isHoliday && (
                        <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                            {dict.account.calendars.holidays}
                        </span>
                    )}
                </div>
                {calendar.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {calendar.description}
                    </p>
                )}
            </Link>

            <div className="flex items-center gap-3">
                <button
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleVisibility(calendar.id, !calendar.isVisible);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={calendar.isMain}
                    title={
                        calendar.isVisible
                            ? dict.account.calendars.hide
                            : dict.account.calendars.show
                    }>
                    {calendar.isVisible ? (
                        <Eye className="h-5 w-5" />
                    ) : (
                        <EyeOff className="h-5 w-5" />
                    )}
                </button>

                {!calendar.isMain && !calendar.isHoliday && (
                    <button
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(calendar.id);
                        }}
                        className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        title={dict.account.calendars.delete}>
                        <Trash2 className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};
