export interface RegisterUserDto {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    region?: string;
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface JwtPayload {
    userId: string;
    username: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface ChangeEmailDto {
    password: string;
    newEmail: string;
}
