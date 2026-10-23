import { createContext,
         useState,
         useEffect,
         useContext,
         useRef,
         type ReactNode,
         type Dispatch,
         type SetStateAction } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import { SESSION_EXPIRED_EVENT } from '../../api';

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
    // True once a session has ended on its own (not via Log out), so the login page can say why
    sessionExpired: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const fetchMe = (): Promise<User | null> =>
    fetch(`${API_BASE_URL}/api/me`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        fetchMe().then((data) => {
            setUser(data);
            setLoading(false);
        });
    }, []);

    // Read by the expiry listener below, which is registered only once
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Any authenticated request that comes back 401 ends the session
    useEffect(() => {
        const onExpired = () => {
            if (userRef.current) setSessionExpired(true);
            setUser(null);
        };
        window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    }, []);

    // A tab left open (or a phone left locked) can outlive the session; check
    // again when it comes back into view instead of waiting for the next click
    useEffect(() => {
        if (!user) return;
        const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            fetchMe().then((data) => {
                if (!data) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
            });
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [user]);

    return (
    <AuthContext.Provider value={{ user, setUser, loading, sessionExpired }}>
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
