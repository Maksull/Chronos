'use client';

import { ErrorModal } from '@/components';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ErrorContextType {
    setError: (message: string) => void;
    clearError: () => void;
    error: string | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [error, setErrorState] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    const setError = (message: string | null) => {
        if (!message) return; // Don't set empty errors

        // Log the error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.warn('Error displayed:', message);
        }

        setErrorState(message);
        setShowModal(true);
    };

    const clearError = () => {
        setErrorState(null);
        setShowModal(false);
    };

    return (
        <ErrorContext.Provider value={{ setError, clearError, error }}>
            {children}
            <ErrorModal
                show={showModal}
                message={error || ''}
                onClose={clearError}
            />
        </ErrorContext.Provider>
    );
};

export const useError = (): ErrorContextType => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};
