'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useDictionary } from './DictionaryContext';

interface User {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    region?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();
    const { lang } = useDictionary();

    // Check if user is already authenticated on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    'http://localhost:3001/auth/verify',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (response.ok) {
                    // If verification is successful, fetch user data
                    const userResponse = await fetch(
                        'http://localhost:3001/users/profile',
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        if (userData.status === 'success') {
                            setUser(userData.data);
                            setIsAuthenticated(true);
                        }
                    }
                } else {
                    // Invalid token, clear localStorage
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);

        // Handle redirect after login
        const searchParams = new URLSearchParams(window.location.search);
        const returnUrl = searchParams.get('returnUrl');

        if (returnUrl && returnUrl.startsWith(`/${lang}/`)) {
            router.push(returnUrl);
        } else {
            router.push(`/${lang}/account`);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        router.push(`/${lang}/login`);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                logout,
                setUser,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;
