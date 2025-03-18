import { ParticipantRole } from '@/entities';

export interface ParticipantWithRoleDto {
    userId: string;
    username: string;
    email: string;
    role: ParticipantRole;
}

export interface CalendarDto {
    id: string;
    name: string;
    description: string | null;
    color: string;
    isMain: boolean;
    isHoliday: boolean;
    isVisible: boolean;
    owner: {
        id: string;
        username: string;
        email: string;
    };
    participants: ParticipantWithRoleDto[];
    categories: any[];
    createdAt: Date;
    updatedAt: Date;
}
