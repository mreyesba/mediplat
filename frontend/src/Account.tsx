import { Outlet, Link, useLocation } from 'react-router-dom';

function Account() {
    const location = useLocation();

    // Check currect URL path to toggle the switch button text dynamically
    const isSignUp = location.pathname.includes('signup');

    return (   
        <div className="account-container p-6 max-w-md mx-auto">
            {/* Title changes dynamically based on active sub-route */}
            <h2 className="text-2xl font-bold mb-4">
                {isSignUp ? "Sign up" : "Log in"}
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
                    ? "If you already have an account, log in"
                    : "Don't have an account, sign up!"
                }
            </Link>
        </div>
    );
}

export default Account;