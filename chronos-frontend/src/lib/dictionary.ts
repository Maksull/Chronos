import 'server-only';
import { Locale } from '@/middleware';

export type Dictionary = {
    navigation: {
        brand: string;
        calendar: string;
        tasks: string;
        events: string;
        notifications: string;
        settings: string;
        profile: string;
        login: string;
        logout: string;
        register: string;
    };
    account: {
        title: string;
        settings: string;
        errors: {
            generic: string;
        };
        common: {
            loading: string;
        };
        profile: {
            title: string;
            description: string;
            update: string;
            updateSuccess: string;
        };
        email: {
            title: string;
            description: string;
            change: string;
            verificationSent: string;
        };
        password: {
            title: string;
            description: string;
            change: string;
            changeSuccess: string;
        };
        fields: {
            username: string;
            email: string;
            fullName: string;
            region: string;
            currentPassword: string;
            newPassword: string;
            newEmail: string;
        };
        welcome: string;
        stats: {
            totalCalendars: string;
            region: string;
            noRegion: string;
            member: string;
        };
        calendars: {
            deleteConfirmTitle: string;
            deleteConfirmMessage: string;
            deleteWarning: string;
            confirmDelete: string;
            title: string;
            create: string;
            cancel: string;
            createSubmit: string;
            createSuccess: string;
            deleteSuccess: string;
            deleteConfirm: string;
            main: string;
            holidays: string;
            hide: string;
            show: string;
            delete: string;
            fields: {
                name: string;
                description: string;
                color: string;
            };
            // New entries
            empty: string;
            advanced: string;
            defaultName: string;
            nameRequired: string;
        };
    };
    settings: {
        backToAccount: string;
        backToSecurity: string;
        title: string;
        changeEmail: string;
        changeEmailDesc: string;
        changePassword: string;
        changePasswordDesc: string;
        settings: string;
        currentEmail: string;
        fields: {
            username: string;
            email: string;
            fullName: string;
            region: string;
            currentPassword: string;
            newPassword: string;
            newEmail: string;
        };
        email: {
            title: string;
            description: string;
            change: string;
            verificationSent: string;
        };
        password: {
            title: string;
            description: string;
            change: string;
            changeSuccess: string;
        };
        errors: {
            generic: string;
        };
        common: {
            loading: string;
        };
    };
    auth: {
        fields: {
            username: string;
            email: string;
            password: string;
            fullName: string;
            region: string;
        };
        errors: {
            generic: string;
            invalidCode: string;
            expiredCode: string;
            alreadyVerified: string;
            emailNotFound: string;
        };
        login: {
            title: string;
            subtitle: string;
            registerLink: string;
            forgotPassword: string;
            submit: string;
            loading: string;
            pleaseLoginToContinue: string;
        };
        register: {
            selectCountry: string;
            detectingLocation: string;
            useIpLocation: string;
            title: string;
            subtitle: string;
            loginLink: string;
            submit: string;
            loading: string;
            passwordRequirement: string;
            termsText: string;
            termsLink: string;
        };
        verifyEmail: {
            title: string;
            description: string;
            subtitle: string;
            checkSpam: string;
            backToLogin: string;
            codeExpiry: string;
            enterCode: string;
            resendCode: string;
            resending: string;
            codeSent: string;
            submit: string;
            loading: string;
            success: string;
            waitResend: string;
        };
        verify: {
            sent: {
                title: string;
                description: string;
                checkSpam: string;
                enterCode: string;
            };
        };
        resetPassword: {
            title: string;
            subtitle: string;
            loginLink: string;
            submit: string;
            loading: string;
            success: string;
            newPasswordTitle: string;
            newPasswordField: string;
            newPasswordSuccess: string;
        };
    };
    calendar?: {
        creatorRoleNotice: string;
        readerRoleNotice: string;
        cannotDeleteSystemCalendar: string;
        noPermission: string;
        viewOnlyMode: string;
        youCreatedThis: string;
        createdBy: string;
        showHolidays: string;
        roleAdmin: string;
        editRole: string;
        removeParticipant: string;
        saveRole: string;
        cancel: string;
        roleCreator: string;
        roleReader: string;
        participant: string;
        noDescription: string;
        deleteConfirmationError: string;
        editCalendar: string;
        generalSettings: string;
        categoriesTab: string;
        sharingTab: string;
        calendarName: string;
        calendarColor: string;
        calendarDescription: string;
        deleteCalendar: string;
        deleteCalendarWarning: string;
        deleteConfirmation: string;
        confirmDelete: string;
        participants: string;
        inviteUsers: string;
        owner: string;
        noParticipants: string;
        totalParticipants: string;
        backToAccount: string;
        returnToAccount: string;
        dayView: string;
        weekView: string;
        monthView: string;
        today: string;
        addEvent: string;
        settings: string;
        noCalendarSelected: string;
        notFound: string;
        inviteNotFound: string;
        inviteAcceptError: string;
        inviteError: string;
        inviteLinks: string;
        inviteLinksDescription: string;
        inviteAccepted: string;
        inviteAcceptedDesc: string;
        viewCalendar: string;
        goToAccount: string;
        calendarInvitation: string;
        invitePromptWithName: string;
        invitePrompt: string;
        accepting: string;
        acceptInvite: string;
        declineInvite: string;
        expiration: string;
        neverExpires: string;
        expireIn1Day: string;
        expireIn7Days: string;
        expireIn30Days: string;
        creating: string;
        createInviteLink: string;
        noInviteLinks: string;
        expired: string;
        created: string;
        expires: string;
        copyLink: string;
        deleteLink: string;
        inviteLinksWarning: string;
        errorOccurred: string;
        eventName: string;
        eventCategory: string;
        categoryArrangement: string;
        categoryReminder: string;
        categoryTask: string;
        confirmDeleteCategory: string;
        manageCategories: string;
        noCategories: string;
        addCategory: string;
        addNewCategory: string;
        categoryName: string;
        description: string;
        color: string;
        editCategory: string;
        startDateTime: string;
        endDateTime: string;
        eventColor: string;
        eventDescription: string;
        eventCreated: string;
        eventUpdated: string;
        eventDeleted: string;
        confirmDeleteEvent: string;
        saveChanges: string;
        deleteEvent: string;
        editEvent: string;
        viewEvent: string;
        completedStatus: string;
        markedComplete: string;
        markedIncomplete: string;
        allDay: string;
        repeatEvent: string;
        repeatOptions: {
            never: string;
            daily: string;
            weekly: string;
            monthly: string;
            yearly: string;
            custom: string;
        };
        selectDate: string;
        selectTime: string;
        duration: string;
        minutes: string;
        hours: string;
        days: string;
        noEvents: string;
        moreEvents: string;
        weekdays: {
            full: string[];
            short: string[];
        };
        timeFormat: {
            am: string;
            pm: string;
            hours24: string;
            hours12: string;
        };
    };
    home: {
        hero: {
            title: {
                first: string;
                second: string;
            };
            description: string;
            buttons: {
                getStarted: string;
                liveDemo: string;
            };
        };
        features: {
            title: string;
            subtitle: string;
            description: string;
            items: {
                calendarViews: {
                    title: string;
                    description: string;
                };
                categories: {
                    title: string;
                    description: string;
                };
                collaboration: {
                    title: string;
                    description: string;
                };
                holidays: {
                    title: string;
                    description: string;
                };
                quickEvents: {
                    title: string;
                    description: string;
                };
                privacy: {
                    title: string;
                    description: string;
                };
            };
        };
        cta: {
            title: {
                first: string;
                second: string;
            };
            description: string;
            button: string;
        };
    };
    footer: {
        brand: string;
        description: string;
        copyright: string;
    };
    NotFound: {
        title: string;
        description: string;
        backHome: string;
    };
    common: {
        back: string;
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        view: string;
        create: string;
        update: string;
        loading: string;
        saving: string;
        deleting: string;
        confirm: string;
        success: string;
        error: string;
        warning: string;
        info: string;
    };
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then(module => module.default),
    uk: () => import('@/dictionaries/uk.json').then(module => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]();
};
