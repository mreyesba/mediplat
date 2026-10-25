import { createContext,
         useContext,
         type Dispatch,
         type SetStateAction } from 'react';

// Lives apart from AuthProvider (AuthContext.tsx) because fast refresh only
// works on files that export nothing but components.

// 1. Declare the strict shape of our logged-in user profile metadata
export interface User {
    username: string;
    first_name: string;
}

// 2. Define the structural blueprint for our global context provider properties
export interface AuthContextType {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
    // True once a session has ended on its own (not via Log out), so the login page can say why
    sessionExpired: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook with a built-in safety check to ensure it's used inside an AuthProvider
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be executed cleanly inside an explicit <AuthProvider> wrapper tree.');
    }

    return context;
};
