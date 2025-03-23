export interface AuthLoginData {
    user: User;
    token: string;
}

export interface AuthRegisterData {
    user: User;
    token: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    region?: string;
    createdAt: string;
    updatedAt: string;
    isEmailVerified: boolean;
    newEmail: string | null;
    verificationCode: string | null;
    verificationCodeExpiresAt: string | null;
    resetPasswordToken: string | null;
    resetPasswordTokenExpiresAt: string | null;
    emailChangeCode: string | null;
    emailChangeCodeExpiresAt: string | null;
}

export interface LoginFormData {
    username: string;
    password: string;
}

export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    region?: string;
}
