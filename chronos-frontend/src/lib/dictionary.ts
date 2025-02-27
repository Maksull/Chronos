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
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then(module => module.default),
    uk: () => import('@/dictionaries/uk.json').then(module => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]();
};
