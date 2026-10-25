import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';
import { SHOW_DASHBOARDS } from '../../featureFlags';

interface NavbarProps {
    user: { username: string; first_name: string } | null;
    setUser: (user: null) => void;
}

function Navbar({ user }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include', // CRITICAL: Permits cookie modifications
            });

            if (response.ok) {
                // Refresh the page or redirect to clear any lingering memory states
                window.location.href = '/';
            } else {
                console.error('Logout request rejected by server.');
            }
        } catch (err) {
            console.error('Failed to communicate with logout pipeline:', err);
        }
    };

    const links = [
        { to: '/', label: t('navbar.home'), show: !!user },
        { to: '/patients', label: t('navbar.patients'), show: !!user },
        { to: '/appointments', label: t('navbar.appointments'), show: !!user },
        { to: '/account', label: t('navbar.account'), show: !user },
        { to: '/dashboards', label: t('navbar.dashboards'), show: SHOW_DASHBOARDS },
    ].filter((link) => link.show);

    const languageSwitcher = (
        <div className="flex gap-1 text-xs">
            {(['en', 'es'] as const).map((lng) => (
                <button
                    key={lng}
                    onClick={() => i18n.changeLanguage(lng)}
                    className={`px-1.5 py-0.5 rounded ${i18n.language === lng ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    {lng.toUpperCase()}
                </button>
            ))}
        </div>
    );

    const logoutButton = user && (
        <button
            onClick={handleLogout}
            className="hover:text-sky-400 transition-colors font-medium text-base p-0 bg-transparent border-none cursor-pointer text-left">
            {t('navbar.logout')}
        </button>
    );

    return (
        <nav className="top-menu bg-slate-900 text-white">
            <div className="flex items-center justify-between p-4">
                {/* Logo / Brand */}
                <div className="font-bold text-xl">
                    CANPER
                </div>

                {/* Desktop: links inline */}
                <div className="hidden md:flex gap-6 items-center">
                    {links.map((link) => (
                        <Link key={link.to} to={link.to} className="hover:text-sky-400 transition-colors">
                            {link.label}
                        </Link>
                    ))}

                    {/* LAST OPTION: The Logout Interactive Trigger */}
                    {logoutButton}

                    <div className="border-l border-slate-700 pl-4 ml-2">
                        {languageSwitcher}
                    </div>
                </div>

                {/* Phone: hamburger toggle */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="md:hidden p-1 -mr-1 text-slate-300 hover:text-white"
                    aria-label={menuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Phone: links stacked under the bar while the menu is open */}
            {menuOpen && (
                <div className="md:hidden flex flex-col items-stretch text-left border-t border-slate-800 px-4 pb-4">
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={closeMenu}
                            className="py-3 border-b border-slate-800 hover:text-sky-400 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user && (
                        <div className="py-3 border-b border-slate-800" onClick={closeMenu}>
                            {logoutButton}
                        </div>
                    )}
                    <div className="pt-3">
                        {languageSwitcher}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
