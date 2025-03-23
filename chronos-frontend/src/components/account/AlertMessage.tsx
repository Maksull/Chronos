'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface AlertMessageProps {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    autoDismiss?: boolean;
    dismissTime?: number;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
    type,
    message,
    autoDismiss = true,
    dismissTime = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoDismiss && message) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, dismissTime);

            return () => clearTimeout(timer);
        }
    }, [autoDismiss, dismissTime, message]);

    if (!isVisible || !message) return null;

    const getAlertStyles = () => {
        switch (type) {
            case 'success':
                return {
                    container:
                        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                    icon: 'text-green-500 dark:text-green-400',
                    text: 'text-green-800 dark:text-green-200',
                };
            case 'error':
                return {
                    container:
                        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                    icon: 'text-red-500 dark:text-red-400',
                    text: 'text-red-800 dark:text-red-200',
                };
            case 'warning':
                return {
                    container:
                        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                    icon: 'text-yellow-500 dark:text-yellow-400',
                    text: 'text-yellow-800 dark:text-yellow-200',
                };
            case 'info':
            default:
                return {
                    container:
                        'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                    icon: 'text-blue-500 dark:text-blue-400',
                    text: 'text-blue-800 dark:text-blue-200',
                };
        }
    };

    const styles = getAlertStyles();

    return (
        <div
            className={`${styles.container} border rounded-xl px-4 py-3 mb-6 flex items-start shadow-sm animate-fadeIn`}
            role="alert">
            <div className="flex-shrink-0 mr-3 mt-0.5">
                {type === 'success' ? (
                    <CheckCircle className={`h-5 w-5 ${styles.icon}`} />
                ) : (
                    <AlertCircle className={`h-5 w-5 ${styles.icon}`} />
                )}
            </div>
            <div className="flex-1">
                <p className={`text-sm ${styles.text}`}>{message}</p>
            </div>
            <button
                className={`ml-4 ${styles.icon} hover:opacity-80 transition-opacity`}
                onClick={() => setIsVisible(false)}>
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};
