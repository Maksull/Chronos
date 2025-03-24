'use client';

import { useDictionary } from '@/contexts/DictionaryContext';
import { useError } from '@/contexts/ErrorContext';

interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
}

interface ErrorResponse {
    message?: string;
    error?: string;
    data?: unknown;
}

export const useApi = () => {
    const { dict } = useDictionary();
    const { setError } = useError();

    // Get the generic error message with fallbacks to ensure we always have a value
    const getGenericErrorMessage = () => {
        return (
            dict?.auth?.errors?.generic ||
            dict?.errors?.generic ||
            'An unexpected error occurred. Please try again.'
        );
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchWithErrorHandling = async <T>(
        endpoint: string,
        options?: RequestInit,
        showErrorModal = true,
    ): Promise<ApiResponse<T>> => {
        try {
            const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            // First check for HTTP error status codes
            if (!response.ok) {
                let errorMessage = getGenericErrorMessage();
                let errorData: ErrorResponse | null = null;

                // Try to get a more specific error message from the response
                try {
                    errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch {
                    // If parsing fails, use status text (removed unused parseError variable)
                    errorMessage = `${response.status}: ${response.statusText || getGenericErrorMessage()}`;
                }

                if (showErrorModal) {
                    setError(errorMessage);
                }

                return {
                    status: 'error',
                    message: errorMessage,
                    data: errorData?.data as T | undefined,
                };
            }

            // If response is OK, parse the JSON normally
            const data: ApiResponse<T> = await response.json();

            if (data.status === 'error' && showErrorModal) {
                setError(data.message || getGenericErrorMessage());
            }

            return data;
        } catch (err) {
            console.error('API request failed:', err);
            const errorMessage = getGenericErrorMessage();

            if (showErrorModal) {
                setError(errorMessage);
            }

            return {
                status: 'error',
                message: errorMessage,
            };
        }
    };

    return {
        get: <T>(endpoint: string, showErrorModal = true) =>
            fetchWithErrorHandling<T>(
                endpoint,
                { method: 'GET' },
                showErrorModal,
            ),

        post: <T, D = Record<string, unknown>>(
            endpoint: string,
            data: D,
            showErrorModal = true,
        ) =>
            fetchWithErrorHandling<T>(
                endpoint,
                {
                    method: 'POST',
                    body: JSON.stringify(data),
                },
                showErrorModal,
            ),

        put: <T, D = Record<string, unknown>>(
            endpoint: string,
            data: D,
            showErrorModal = true,
        ) =>
            fetchWithErrorHandling<T>(
                endpoint,
                {
                    method: 'PUT',
                    body: JSON.stringify(data),
                },
                showErrorModal,
            ),

        delete: <T>(endpoint: string, showErrorModal = true) =>
            fetchWithErrorHandling<T>(
                endpoint,
                { method: 'DELETE' },
                showErrorModal,
            ),
    };
};
