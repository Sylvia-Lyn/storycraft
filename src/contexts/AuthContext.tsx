import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    user_id: number;
    user_name: string;
    user_email: string;
    user_plan: string;
    user_piont: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 从localStorage恢复用户状态
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = (userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 