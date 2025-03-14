'use client';
import React, { useState } from 'react';
import {
    User,
    UserPlus,
    Crown,
    Shield,
    Edit,
    PenTool,
    Eye,
    Check,
    X,
    ChevronDown,
} from 'lucide-react';
import { CalendarData, ParticipantRole } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';

interface CalendarParticipantsProps {
    calendar: CalendarData;
    dict: Dictionary;
    onShowInviteModal?: () => void;
    isOwner: boolean;
    currentUserRole?: ParticipantRole;
    onUpdateRole?: (userId: string, role: ParticipantRole) => Promise<void>;
    onRemoveParticipant?: (userId: string) => Promise<void>;
}

export const CalendarParticipants: React.FC<CalendarParticipantsProps> = ({
    calendar,
    dict,
    onShowInviteModal,
    isOwner,
    currentUserRole,
    onUpdateRole,
    onRemoveParticipant,
}) => {
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<ParticipantRole | null>(
        null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!calendar) return null;

    // Extract owner and participants
    const owner = calendar.owner;
    const participants = calendar.participants || [];

    // Check if current user has admin permissions
    const canManageParticipants =
        isOwner || currentUserRole === ParticipantRole.ADMIN;

    const handleRoleChange = async (userId: string) => {
        if (!selectedRole || !onUpdateRole) return;

        setIsSubmitting(true);
        try {
            await onUpdateRole(userId, selectedRole);
            setEditingUserId(null);
            setSelectedRole(null);
        } catch (error) {
            console.error('Failed to update role:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveParticipant = async (userId: string) => {
        if (!onRemoveParticipant) return;

        setIsSubmitting(true);
        try {
            await onRemoveParticipant(userId);
        } catch (error) {
            console.error('Failed to remove participant:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get role icon and label
    const getRoleInfo = (role: ParticipantRole) => {
        switch (role) {
            case ParticipantRole.ADMIN:
                return {
                    icon: (
                        <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    ),
                    label: dict.calendar?.roleAdmin || 'Admin',
                };
            case ParticipantRole.CREATOR:
                return {
                    icon: (
                        <PenTool className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ),
                    label: dict.calendar?.roleCreator || 'Creator',
                };
            case ParticipantRole.READER:
                return {
                    icon: (
                        <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ),
                    label: dict.calendar?.roleReader || 'Reader',
                };
            default:
                return {
                    icon: (
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ),
                    label: dict.calendar?.participant || 'Participant',
                };
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {dict.calendar?.participants || 'Participants'}
                </h3>
                {canManageParticipants && (
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
                    participants.map(participant => {
                        const roleInfo = getRoleInfo(participant.role);
                        const isEditing = editingUserId === participant.userId;

                        return (
                            <div
                                key={participant.userId}
                                className="flex flex-wrap items-center py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/70">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mr-2">
                                    {roleInfo.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {participant.username || 'Unknown'}
                                    </p>
                                    <div className="flex items-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                            {participant.email || ''}
                                        </p>
                                        {!isEditing && (
                                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">
                                                {roleInfo.label}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions section */}
                                <div className="flex items-center ml-auto">
                                    {/* Role management for admins and owners */}
                                    {canManageParticipants && !isEditing && (
                                        <button
                                            onClick={() => {
                                                setEditingUserId(
                                                    participant.userId,
                                                );
                                                setSelectedRole(
                                                    participant.role,
                                                );
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title={
                                                dict.calendar?.editRole ||
                                                'Edit role'
                                            }>
                                            <Edit className="h-3.5 w-3.5" />
                                        </button>
                                    )}

                                    {/* Remove participant button */}
                                    {canManageParticipants && !isEditing && (
                                        <button
                                            onClick={() =>
                                                handleRemoveParticipant(
                                                    participant.userId,
                                                )
                                            }
                                            disabled={isSubmitting}
                                            className="ml-1 p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title={
                                                dict.calendar
                                                    ?.removeParticipant ||
                                                'Remove participant'
                                            }>
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Edit mode - full width row */}
                                {isEditing && (
                                    <div className="w-full mt-2 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="relative">
                                                <select
                                                    value={
                                                        selectedRole ||
                                                        participant.role
                                                    }
                                                    onChange={e =>
                                                        setSelectedRole(
                                                            e.target
                                                                .value as ParticipantRole,
                                                        )
                                                    }
                                                    className="appearance-none block w-28 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option
                                                        value={
                                                            ParticipantRole.ADMIN
                                                        }>
                                                        {dict.calendar
                                                            ?.roleAdmin ||
                                                            'Admin'}
                                                    </option>
                                                    <option
                                                        value={
                                                            ParticipantRole.CREATOR
                                                        }>
                                                        {dict.calendar
                                                            ?.roleCreator ||
                                                            'Creator'}
                                                    </option>
                                                    <option
                                                        value={
                                                            ParticipantRole.READER
                                                        }>
                                                        {dict.calendar
                                                            ?.roleReader ||
                                                            'Reader'}
                                                    </option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() =>
                                                    handleRoleChange(
                                                        participant.userId,
                                                    )
                                                }
                                                disabled={isSubmitting}
                                                className="p-1 text-green-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title={
                                                    dict.calendar?.saveRole ||
                                                    'Save role'
                                                }>
                                                <Check className="h-3.5 w-3.5" />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setEditingUserId(null);
                                                    setSelectedRole(null);
                                                }}
                                                disabled={isSubmitting}
                                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title={
                                                    dict.calendar?.cancel ||
                                                    'Cancel'
                                                }>
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
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
