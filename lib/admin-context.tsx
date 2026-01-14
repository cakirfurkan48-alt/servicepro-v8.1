'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    ad: string;
    email: string;
    rol: 'admin' | 'yetkili';
}

interface AdminContextType {
    user: User | null;
    isAdmin: boolean;
    isEditMode: boolean;
    toggleEditMode: () => void;
    isLoggedIn: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsEditMode(false);
        localStorage.removeItem('user');
    };

    const toggleEditMode = () => {
        if (user?.rol === 'admin') {
            setIsEditMode(!isEditMode);
        }
    };

    const value: AdminContextType = {
        user,
        isAdmin: user?.rol === 'admin',
        isEditMode,
        toggleEditMode,
        isLoggedIn: !!user,
        login,
        logout,
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
