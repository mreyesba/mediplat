import { Link } from 'react-router-dom';
import Patients from './Patients';

interface NavbarProps {
    user: { username: string; first_name: string } | null;
    setUser: (user: null) => void;
}

function Navbar({ user, setUser }: NavbarProps) {
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
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
                MyBrand
            </div>

            {/* Navigation Links */}
            <div className="flex gap-6">
                <Link to="/" className="hover:text-sky-400 transition-colors">
                    Home
                </Link>
                <Link to="/about" className="hover:text-sky-400 transition-colors">
                    About
                </Link>

                {/* HashLink to jump to Contact section */}
                {!user && (
                    <a href="/#contact-section" className="hover:text-sky-400 smooth-scroll">
                        Contact
                    </a>
                )}

                {user && 
                <Link to="/patients" className="hover:text-sky-400 transition-colors">
                    Patients
                </Link>}

                {!user && 
                <Link to="/account" className="hover:text-sky-400 transition-colors">
                    Account
                </Link>}

                <Link to="/dashboards" className="hover:text-sky-400 transition-colors">
                    Dashboards
                </Link>

                {/* LAST OPTION: The Logout Interactive Trigger */}
                {user && (
                    <button 
                    onClick={handleLogout} 
                    className="hover:text-sky-400 transition-colors font-medium text-base p-0 bg-transparent border-none cursor-pointer"
                    >
                        Log Out
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;