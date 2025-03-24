import React from 'react';
import { Dictionary } from '@/lib/dictionary';
import { CalendarFormData } from '@/types/account';

interface CalendarFormProps {
    newCalendarData: CalendarFormData;
    setNewCalendarData: React.Dispatch<React.SetStateAction<CalendarFormData>>;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    dict: Dictionary;
}

export const CalendarForm: React.FC<CalendarFormProps> = ({
    newCalendarData,
    setNewCalendarData,
    onSubmit,
    isLoading,
    dict,
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {dict.account.calendars.fields.name}
                    </label>
                    <input
                        type="text"
                        required
                        value={newCalendarData.name}
                        onChange={e =>
                            setNewCalendarData(prev => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                        {dict.account.calendars.fields.color}
                    </label>
                    <input
                        type="color"
                        value={newCalendarData.color}
                        onChange={e =>
                            setNewCalendarData(prev => ({
                                ...prev,
                                color: e.target.value,
                            }))
                        }
                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 px-1 bg-white dark:bg-gray-700"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {dict.account.calendars.fields.description}
                </label>
                <textarea
                    value={newCalendarData.description}
                    onChange={e =>
                        setNewCalendarData(prev => ({
                            ...prev,
                            description: e.target.value,
                        }))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    rows={3}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                {isLoading
                    ? dict.account.common.loading
                    : dict.account.calendars.createSubmit}
            </button>
        </form>
    );
};
