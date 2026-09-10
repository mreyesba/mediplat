import { Link } from 'react-router-dom';
import { API_BASE_URL } from './apiConfig';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
    user: { username: string; first_name: string } | null;
    setUser: (user: null) => void;
}

function Navbar({ user }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include', // CRITICAL: Permits cookie modifications
            });

            if (response.ok) {
                // Refresh the page or redirect to clear any lingering memory states
                window.location.href = '/account'; 
            } else {
                console.error('Logout request rejected by server.');
            }
        } catch (err) {
            console.error('Failed to communicate with logout pipeline:', err);
        }
    };

    return (
        <nav className="top-menu flex items-center justify-between p-4 bg-slate-900 text-white">
            {/* Logo / Brand */}
            <div className="font-bold text-xl">
                CANPER
            </div>

            {/* Navigation Links */}
            <div className="flex gap-6 items-center">
                {user &&
                <Link to="/" className="hover:text-sky-400 transition-colors">
                    {t('navbar.home')}
                </Link>}

                {user &&
                <Link to="/patients" className="hover:text-sky-400 transition-colors">
                    {t('navbar.patients')}
                </Link>}

                {user &&
                <Link to="/appointments" className="hover:text-sky-400 transition-colors">
                    {t('navbar.appointments')}
                </Link>}

                {!user &&
                <Link to="/account" className="hover:text-sky-400 transition-colors">
                    {t('navbar.account')}
                </Link>}

                <Link to="/dashboards" className="hover:text-sky-400 transition-colors">
                    {t('navbar.dashboards')}
                </Link>

                {/* LAST OPTION: The Logout Interactive Trigger */}
                {user && (
                    <button
                    onClick={handleLogout}
                    className="hover:text-sky-400 transition-colors font-medium text-base p-0 bg-transparent border-none cursor-pointer">
                        {t('navbar.logout')}
                    </button>
                )}

                <div className="flex gap-1 text-xs border-l border-slate-700 pl-4 ml-2">
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={`px-1.5 py-0.5 rounded ${i18n.language === 'en' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => i18n.changeLanguage('es')}
                        className={`px-1.5 py-0.5 rounded ${i18n.language === 'es' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        ES
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;