import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Account() {
    const { t } = useTranslation();
    const location = useLocation();

    // Check currect URL path to toggle the switch button text dynamically
    const isSignUp = location.pathname.includes('signup');

    return (
        <div className="account-container p-6 max-w-md mx-auto">
            {/* Title changes dynamically based on active sub-route */}
            <h2 className="text-2xl font-bold mb-4">
                {isSignUp ? t('account.signup') : t('account.login')}
            </h2>

            {/* This placeholder injects either the Login or Signup version of FormsPage */}
            <div className="mb-6">
                <Outlet />
            </div>

            {/* Button Changes into a Router Link to swap sub-pages without losing app state */}
            <Link
                to={isSignUp ? "/account/login" : "/account/signup"}
                className="text-blue-600 hover:underline block text-center"
            >
                {isSignUp
                    ? t('account.haveAccount')
                    : t('account.noAccount')
                }
            </Link>
        </div>
    );
}

export default Account;