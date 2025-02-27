// src/components/account/AlertMessage.tsx
import { X } from 'lucide-react';

interface AlertMessageProps {
    type: 'success' | 'error';
    message: string;
    onClose?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
    type,
    message,
    onClose,
}) => {
    if (type === 'success') {
        return (
            <div className="mb-6 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded">
                <div className="flex justify-between items-center">
                    <p className="text-green-700 dark:text-green-200">
                        {message}
                    </p>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-green-500 hover:text-green-700 dark:hover:text-green-300">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
            <div className="flex-shrink-0 text-red-500">
                <X className="h-5 w-5" />
            </div>
            <p className="text-red-700 dark:text-red-200 flex-grow">
                {message}
            </p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-300">
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};
