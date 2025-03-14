// src/types/account.ts

export enum ParticipantRole {
    ADMIN = 'admin',
    CREATOR = 'creator',
    READER = 'reader',
}

export interface ParticipantData {
    userId: string;
    username: string;
    email: string;
    role: ParticipantRole;
}

export interface ProfileData {
    username: string;
    fullName: string;
    email: string;
    region: string;
    createdAt: string;
}

export interface CalendarData {
    id: string;
    name: string;
    description: string;
    color: string;
    isMain: boolean;
    isHoliday: boolean;
    isVisible: boolean;
    owner: {
        id: string;
        username: string;
        email: string;
    };
    participants: ParticipantData[];
    categories: CategoryData[];
    createdAt: string;
    updatedAt: string;
}

export interface CalendarFormData {
    name: string;
    description: string;
    color: string;
}

export interface CategoryData {
    id: string;
    name: string;
    description: string | null;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventData {
    id: string;
    name: string;
    category: CategoryData;
    startDate: string;
    endDate: string;
    description: string | null;
    color: string;
    isCompleted: boolean;
    creator: {
        id: string;
        username: string;
    };
    invitees?: {
        id: string;
        username: string;
    }[];
    createdAt: string;
    updatedAt: string;
}
