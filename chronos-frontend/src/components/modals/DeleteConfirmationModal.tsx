'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Dictionary } from '@/lib/dictionary';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    calendarName: string;
    dict: Dictionary;
}

export const DeleteConfirmationModal: React.FC<
    DeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, calendarName, dict }) => {
    if (!isOpen) return null;

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {dict.account.calendars.deleteConfirmTitle ||
                            'Delete Calendar'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        {dict.account.calendars.deleteConfirmMessage ||
                            'Are you sure you want to delete this calendar?'}
                        <span className="font-medium text-gray-900 dark:text-white">
                            {' '}
                            &quot;{calendarName}&quot;
                        </span>
                        ?
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {dict.account.calendars.deleteWarning ||
                            'This action cannot be undone. All events in this calendar will be permanently deleted.'}
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        {dict.account.calendars.cancel || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors">
                        {dict.account.calendars.confirmDelete || 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};
