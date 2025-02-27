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
