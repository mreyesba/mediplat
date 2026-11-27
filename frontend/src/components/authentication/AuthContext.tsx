import { useState,
         useEffect,
         useRef,
         type ReactNode } from 'react';
import { apiFetch, SESSION_EXPIRED_EVENT } from '../../api';
import { AuthContext, type User } from './useAuth';
import { usePostHog } from '@posthog/react';

// A 401 here ends the session through apiFetch; a network error just yields
// null without ending it, so a flaky connection doesn't log anyone out
const fetchMe = (): Promise<User | null> =>
    apiFetch('/api/me')
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

function AuthProvider({ children }: { children: ReactNode }) {
    const posthog = usePostHog();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        fetchMe().then((data) => {
            setUser(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        // Role becomes a person property, so insights can be split by staff type
        if (user) posthog?.identify(String(user.id), { role: user.role });
    }, [user, posthog]);

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
            if (document.visibilityState === 'visible') fetchMe();
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
