import { createContext, 
         useState, 
         useEffect, 
         useContext, 
         type ReactNode, 
         type Dispatch, 
         type SetStateAction } from 'react';

// 1. Declare the strict shape of our logged-in user profile metadata
export interface User {
    username: string;
    first_name: string;
}

// 2. Define the structural blueprint for our global context provider properties
interface AuthContextType {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: User | null) => {
            setUser(data);
            setLoading(false);
        })
        .catch(() => {
            setUser(null);
            setLoading(false);
        });
    }, []);

    return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
    {children}
    </AuthContext.Provider>
    );
}

export default AuthProvider;

// Custom hook with a built-in safety check to ensure it's used inside an AuthProvider
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be executed cleanly inside an explicit <AuthProvider> wrapper tree.');
    }
    
    return context;
};
