import { API_BASE_URL } from './apiConfig';

export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

// Authenticated calls go through here so an expired session is noticed in one
// place: a 401 tells AuthProvider to drop the user, which routes to /account.
export async function apiFetch(path: string, init: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...init });
    if (response.status === 401) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return response;
}
