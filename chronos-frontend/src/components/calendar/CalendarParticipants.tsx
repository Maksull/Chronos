import React from 'react';
import { User, UserPlus, Crown } from 'lucide-react';
import { CalendarData } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';

interface CalendarParticipantsProps {
    calendar: CalendarData;
    dict: Dictionary;
    onShowInviteModal?: () => void;
    isOwner: boolean;
}

export const CalendarParticipants: React.FC<CalendarParticipantsProps> = ({
    calendar,
    dict,
    onShowInviteModal,
    isOwner,
}) => {
    if (!calendar) return null;

    // Extract owner and participants
    const owner = calendar.owner;
    const participants = calendar.participants || [];

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {dict.calendar?.participants || 'Participants'}
                </h3>
                {isOwner && (
                    <button
                        onClick={onShowInviteModal}
                        className="text-xs flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        {dict.calendar?.inviteUsers || 'Invite Users'}
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {/* Owner */}
                <div className="flex items-center py-1.5 px-2 rounded-md bg-gray-50 dark:bg-gray-700">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-2">
                        <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {owner?.username || owner?.fullName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {dict.calendar?.owner || 'Owner'}
                        </p>
                    </div>
                </div>

                {/* Participants */}
                {participants.length > 0 ? (
                    participants.map(participant => (
                        <div
                            key={participant.id}
                            className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/70">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mr-2">
                                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {participant.username ||
                                        participant.fullName ||
                                        'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {participant.email || ''}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        {dict.calendar?.noParticipants || 'No participants yet'}
                    </div>
                )}
            </div>

            {participants.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-500 dark:text-gray-400">
                    {dict.calendar?.totalParticipants?.replace(
                        '{count}',
                        participants.length.toString(),
                    ) || `${participants.length} participants`}
                </div>
            )}
        </div>
    );
};
