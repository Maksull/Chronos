// src/types/account.ts

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
    description: string | null;
    color: string;
    isMain: boolean;
    isHoliday: boolean;
    isVisible: boolean;
}

export interface CalendarFormData {
    name: string;
    description: string;
    color: string;
}

export enum EventCategory {
    ARRANGEMENT = 'ARRANGEMENT',
    REMINDER = 'REMINDER',
    TASK = 'TASK',
}

export interface EventData {
    id: string;
    name: string;
    category: EventCategory;
    startDate: string;
    endDate: string;
    description?: string;
    color: string;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
}

// Make sure to add this to your CalendarData interface
export interface CalendarData {
    id: string;
    name: string;
    description: string | null;
    color: string;
    isMain: boolean;
    isHoliday: boolean;
    isVisible: boolean;
    events?: EventData[];
    createdAt: string;
    updatedAt: string;
}
