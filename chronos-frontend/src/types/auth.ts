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

export interface AuthResponse {
    status: 'success' | 'error';
    data?: {
        user: {
            id: string;
            username: string;
            email: string;
            fullName?: string;
            region?: string;
        };
        token: string;
    };
    message?: string;
}
