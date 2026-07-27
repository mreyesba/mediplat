import { Link } from 'react-router-dom';

function Navbar() {

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
                <a href="/#contact-section" className="hover:text-sky-400 smooth-scroll">
                    Contact
                </a>

                <Link to="/account" className="hover:text-sky-400 transition-colors">
                    Account
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;