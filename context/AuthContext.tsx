
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'dnfUser';
const APP_STATE_KEY = 'dnfAppState';

const getInitialUser = (): User | null => {
    try {
        const serializedUser = localStorage.getItem(AUTH_USER_KEY);
        if (serializedUser) {
            return JSON.parse(serializedUser);
        }
        return null;
    } catch (error) {
        console.error("Could not load user from local storage", error);
        return null;
    }
}

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser());

    // Mock login function
    const login = async (email: string, pass: string): Promise<void> => {
        console.log(`Attempting login for ${email}`);
        // In a real app, this would be an API call
        const mockUser: User = { id: 'user-123', email, name: email.split('@')[0] };
        setCurrentUser(mockUser);
    };
    
    // Mock Google sign in
    const signInWithGoogle = async (): Promise<void> => {
        const mockUser: User = { id: 'google-456', email: 'user@google.com', name: 'Google User' };
        setCurrentUser(mockUser);
    }

    const logout = () => {
        setCurrentUser(null);
    };

    // Effect to persist user to localStorage
    useEffect(() => {
        try {
            if (currentUser) {
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
            } else {
                localStorage.removeItem(AUTH_USER_KEY);
                // Also clear the app state on logout to prevent data leakage between users
                localStorage.removeItem(APP_STATE_KEY);
            }
        } catch (error) {
            console.error("Could not save user to local storage", error);
        }
    }, [currentUser]);


    const value: AuthContextType = {
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        signInWithGoogle,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};
