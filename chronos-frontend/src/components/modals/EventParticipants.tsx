'use client';
import React, { useState, useEffect } from 'react';
import {
    User,
    Plus,
    UserX,
    X,
    Check,
    RefreshCw,
    Mail,
    AlertCircle,
    Trash,
} from 'lucide-react';
import { ParticipantRole } from '@/types/account';
import { Dictionary } from '@/lib/dictionary';

interface EventParticipant {
    id: string;
    userId: string;
    eventId: string;
    hasConfirmed: boolean;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

interface EventEmailInvite {
    id: string;
    eventId: string;
    email: string;
    createdAt: string;
    expiresAt: string | null;
}

interface EventParticipantsProps {
    eventId: string | undefined;
    calendarId: string;
    mode: 'view' | 'edit' | 'create';
    userRole?: ParticipantRole;
    dict: Dictionary;
    isCreator: boolean;
    isAdmin: boolean;
    isCalendarOwner?: boolean; // Added prop to identify calendar owner
}

export const EventParticipants: React.FC<EventParticipantsProps> = ({
    eventId,
    mode,
    dict,
    isCreator,
    isAdmin,
    isCalendarOwner = false, // Default to false if not provided
}) => {
    const [participants, setParticipants] = useState<EventParticipant[]>([]);
    const [pendingInvites, setPendingInvites] = useState<EventEmailInvite[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [emailError, setEmailError] = useState('');
    const [inviting, setInviting] = useState(false);

    // Event creators have the same permissions as admins
    const canManageParticipants = isAdmin || isCreator;
    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        if (eventId && mode !== 'create') {
            fetchParticipants();
            if (canManageParticipants) {
                fetchPendingInvites();
            }
        }
    }, [eventId, mode, canManageParticipants]);

    const fetchParticipants = async () => {
        if (!eventId) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `http://localhost:3001/events/${eventId}/participants`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                const participantsData = data.data || [];
                const enrichedParticipants = [...participantsData];
                for (let i = 0; i < participantsData.length; i++) {
                    const participant = participantsData[i];
                    if (!participant.user && participant.userId) {
                        try {
                            const userResponse = await fetch(
                                `http://localhost:3001/users/${participant.userId}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                                    },
                                },
                            );
                            const userData = await userResponse.json();
                            if (userData.status === 'success') {
                                enrichedParticipants[i] = {
                                    ...participant,
                                    user: userData.data,
                                };
                            }
                        } catch (err) {
                            console.error('Error fetching user data:', err);
                        }
                    }
                }
                setParticipants(enrichedParticipants);
            } else {
                setError(data.message || 'Failed to load participants');
            }
        } catch (error) {
            console.error('Error fetching participants:', error);
            setError('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingInvites = async () => {
        if (!eventId) return;
        try {
            const response = await fetch(
                `http://localhost:3001/events/${eventId}/email-invites`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setPendingInvites(data.data || []);
            } else {
                console.error('Error fetching invites:', data.message);
            }
        } catch (error) {
            console.error('Error fetching pending invites:', error);
        }
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAddEmail = () => {
        const trimmedEmail = emailInput.trim().toLowerCase();
        if (!trimmedEmail) {
            setEmailError('Email cannot be empty');
            return;
        }
        if (!isValidEmail(trimmedEmail)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        if (emails.includes(trimmedEmail)) {
            setEmailError('This email is already added');
            return;
        }
        setEmails([...emails, trimmedEmail]);
        setEmailInput('');
        setEmailError('');
    };

    const handleRemoveEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const handleSendInvitations = async () => {
        if (emails.length === 0) return;
        setInviting(true);
        setError('');
        try {
            const response = await fetch(
                `http://localhost:3001/events/${eventId}/email-invites`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        emails,
                        expireInDays: 7,
                    }),
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setShowInviteModal(false);
                setEmails([]);
                setEmailInput('');
                fetchParticipants();
                fetchPendingInvites();
            } else {
                setError(data.message || 'Failed to send invitations');
            }
        } catch (error) {
            console.error('Error sending invitations:', error);
            setError('Failed to send invitations');
        } finally {
            setInviting(false);
        }
    };

    const handleDeleteInvite = async (inviteId: string) => {
        try {
            const response = await fetch(
                `http://localhost:3001/events/email-invites/${inviteId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setPendingInvites(
                    pendingInvites.filter(invite => invite.id !== inviteId),
                );
            } else {
                setError(data.message || 'Failed to delete invitation');
            }
        } catch (error) {
            console.error('Error deleting invitation:', error);
            setError('Failed to delete invitation');
        }
    };

    const handleConfirmParticipation = async (confirm: boolean) => {
        if (!eventId || !currentUserId) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `http://localhost:3001/events/${eventId}/participation`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ hasConfirmed: confirm }),
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setParticipants(
                    participants.map(p =>
                        p.userId === currentUserId
                            ? { ...p, hasConfirmed: confirm }
                            : p,
                    ),
                );
            } else {
                setError(data.message || 'Failed to update participation');
            }
        } catch (error) {
            console.error('Error updating participation:', error);
            setError('Failed to update participation');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveParticipant = async (userId: string) => {
        if (!eventId) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `http://localhost:3001/events/${eventId}/participants/${userId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            );
            const data = await response.json();
            if (data.status === 'success') {
                setParticipants(participants.filter(p => p.userId !== userId));
            } else {
                setError(data.message || 'Failed to remove participant');
            }
        } catch (error) {
            console.error('Error removing participant:', error);
            setError('Failed to remove participant');
        } finally {
            setLoading(false);
        }
    };

    const currentUserParticipation = participants.find(
        p => p.userId === currentUserId,
    );
    const isCurrentUserParticipant = !!currentUserParticipation;

    // Calendar owners who are not participants should see option to request invitation
    const showJoinRequestOption =
        isCalendarOwner && !isCurrentUserParticipant && mode !== 'create';

    return (
        <div className="mt-6 mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {dict.calendar?.participants || 'Participants'} (
                    {participants.length})
                </h3>

                {/* Only show invite button if user can manage participants and not in create mode */}
                {canManageParticipants && mode !== 'create' && eventId && (
                    <button
                        type="button"
                        onClick={() => setShowInviteModal(true)}
                        className="px-3 py-1 text-xs flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        <Mail className="h-3 w-3" />
                        <span>
                            {dict.calendar?.inviteByEmail || 'Invite by Email'}
                        </span>
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs">
                    {error}
                </div>
            )}

            {/* Current user's participation actions - show for all participants, including calendar owners */}
            {mode !== 'create' && currentUserParticipation && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {dict.calendar?.yourParticipation ||
                            'Your participation'}
                        :
                        {currentUserParticipation.hasConfirmed ? (
                            <span className="ml-2 text-green-600 dark:text-green-400">
                                {dict.calendar?.confirmed || 'Confirmed'}
                            </span>
                        ) : (
                            <span className="ml-2 text-amber-600 dark:text-amber-400">
                                {dict.calendar?.notConfirmed || 'Not confirmed'}
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        {!currentUserParticipation.hasConfirmed ? (
                            <button
                                type="button"
                                onClick={() => handleConfirmParticipation(true)}
                                disabled={loading}
                                className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs flex items-center space-x-1 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50">
                                <Check className="h-3 w-3" />
                                <span>
                                    {dict.calendar?.confirm || 'Confirm'}
                                </span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    handleConfirmParticipation(false)
                                }
                                disabled={loading}
                                className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-xs flex items-center space-x-1 hover:bg-amber-200 dark:hover:bg-amber-900/50 disabled:opacity-50">
                                <X className="h-3 w-3" />
                                <span>
                                    {dict.calendar?.decline || 'Decline'}
                                </span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() =>
                                handleRemoveParticipant(currentUserId!)
                            }
                            disabled={loading}
                            className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs flex items-center space-x-1 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50">
                            <UserX className="h-3 w-3" />
                            <span>{dict.calendar?.leave || 'Leave'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Optional section for calendar owner to request invitation */}
            {showJoinRequestOption && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {dict.calendar?.notParticipating ||
                            'You are not participating in this event'}
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowInviteModal(true)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md text-xs flex items-center space-x-1 hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                        <Mail className="h-3 w-3" />
                        <span>
                            {dict.calendar?.requestInvite || 'Request Invite'}
                        </span>
                    </button>
                </div>
            )}

            {/* Pending invitations section (only visible to admins/creators) */}
            {canManageParticipants && pendingInvites.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {dict.calendar?.pendingInvitations ||
                            'Pending Invitations'}{' '}
                        ({pendingInvites.length})
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pendingInvites.map(invite => (
                                <li
                                    key={invite.id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-7 w-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                                            <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-200">
                                                {invite.email}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(
                                                    invite.createdAt,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteInvite(invite.id)
                                        }
                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Participants list */}
            {loading && participants.length === 0 ? (
                <div className="flex justify-center p-6">
                    <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
            ) : participants.length > 0 ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {participants.map(participant => (
                            <li
                                key={participant.userId}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-3">
                                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {participant.user?.username ||
                                                'Unknown User'}
                                            {participant.userId ===
                                                currentUserId && (
                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                    ({dict.common?.you || 'You'}
                                                    )
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {participant.hasConfirmed ? (
                                                <span className="text-green-600 dark:text-green-400">
                                                    {dict.calendar?.confirmed ||
                                                        'Confirmed'}
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 dark:text-amber-400">
                                                    {dict.calendar
                                                        ?.notConfirmed ||
                                                        'Not confirmed'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {(canManageParticipants ||
                                    participant.userId === currentUserId) &&
                                    mode !== 'view' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveParticipant(
                                                    participant.userId,
                                                )
                                            }
                                            disabled={loading}
                                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                            <UserX className="h-4 w-4" />
                                        </button>
                                    )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md text-center text-sm text-gray-500 dark:text-gray-400">
                    {mode === 'create'
                        ? dict.calendar?.participantsAddedAfterCreation ||
                          'Participants will be added after event creation'
                        : dict.calendar?.noParticipants ||
                          'No participants yet'}
                </div>
            )}

            {/* Email Invitation Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {dict.calendar?.inviteByEmail ||
                                    'Invite by Email'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setEmails([]);
                                    setEmailInput('');
                                    setEmailError('');
                                }}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {error && (
                                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs">
                                    {error}
                                </div>
                            )}

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {dict.calendar?.inviteEmailInfo ||
                                    'Only calendar participants can be invited to this event. Enter their email addresses below.'}
                            </p>
                            <div className="mb-4">
                                <div className="flex space-x-2">
                                    <div className="relative flex-grow">
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={emailInput}
                                            onChange={e =>
                                                setEmailInput(e.target.value)
                                            }
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddEmail();
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        {emailError && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddEmail}
                                        className="px-3 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md text-sm flex items-center space-x-1 hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                                        <Plus className="h-4 w-4" />
                                        <span>{dict.common?.add || 'Add'}</span>
                                    </button>
                                </div>
                                {emailError && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {emailError}
                                    </p>
                                )}
                            </div>
                            {emails.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {dict.calendar?.emailsToInvite ||
                                            'Emails to invite:'}{' '}
                                        ({emails.length})
                                    </h3>
                                    <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 max-h-40 overflow-y-auto">
                                        <ul className="space-y-1">
                                            {emails.map(email => (
                                                <li
                                                    key={email}
                                                    className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {email}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveEmail(
                                                                email,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowInviteModal(false);
                                        setEmails([]);
                                        setEmailInput('');
                                        setEmailError('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    {dict.common?.cancel || 'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendInvitations}
                                    disabled={inviting || emails.length === 0}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {inviting ? (
                                        <span className="flex items-center">
                                            <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                            {dict.common?.sending ||
                                                'Sending...'}
                                        </span>
                                    ) : (
                                        dict.calendar?.sendInvites ||
                                        'Send Invites'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
