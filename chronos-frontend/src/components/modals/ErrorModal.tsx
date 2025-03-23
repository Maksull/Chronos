'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ErrorModalProps {
    show: boolean;
    message: string;
    onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
    show,
    message,
    onClose,
}) => {
    if (!show || !message) return null; // Don't show if there's no message or show is false

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with click-away functionality */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative z-10 bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Error
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}>
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Error Message */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                        {message}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 sm:mt-6">
                        <button
                            type="button"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            onClick={onClose}>
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
