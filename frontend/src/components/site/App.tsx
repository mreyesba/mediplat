import { lazy, Suspense, type ReactElement } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n.ts';
import { SHOW_DASHBOARDS } from '../../featureFlags.ts';
import Navbar from './Navbar.tsx';
import Home from '../../Home.tsx';
import Account from '../../Account.tsx';
import FormsPage from '../authentication/FormsPage.tsx';
import { useAuth } from '../authentication/useAuth.ts';
import Patients from '../patients/Patients.tsx';
import Appointments from '../appointments/Appointment.tsx';

// Loaded on demand so the charting library stays out of the main bundle
const Dashboards = lazy(() => import('../dashboards/Dashboards.tsx'));

// Simple Page Components
const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

function App() {
    const { user, setUser, loading } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    // Pages that need a session send you to log in, remembering where you were
    const requireUser = (page: ReactElement) =>
        user ? page : <Navigate to="/account" replace state={{ from: location.pathname }} />;
    const returnTo = (location.state as { from?: string } | null)?.from ?? '/';

    // Wait for /api/me before routing; otherwise "/" sees user === null for a
    // moment and bounces a logged-in user to /account. The hosted backend can
    // take a while to wake up, so say what's happening instead of a blank page.
    if (loading) {
        return <p className="py-24 text-slate-400">{t('app.loading')}</p>;
    }

	return (
		<div>
			<Navbar user={user} setUser={setUser}/>

			{/* Page Display Area */}
            <Routes>
                <Route path="/" element={requireUser(<Home />)} />
                {/* Nested Routes inside Account */}
                {/* Once logged in, go back to the page that asked for the login (see requireUser) */}
                <Route path="/account" element={!user ? <Account /> : <Navigate to={returnTo} replace />}>
                    <Route index element={<FormsPage type="login" />} />
                    {/* This renders at /account/profile */}
                    <Route path="login" element={<FormsPage type="login" />} />
                    {/* This renders at /account/settings */}
                    <Route path="signup" element={<FormsPage type="signup" />} />
                </Route>
                <Route path="/patients" element={requireUser(<Patients />)} />
                <Route path="/appointments" element={requireUser(<Appointments />)} />
                {SHOW_DASHBOARDS && <Route path="/dashboards" element={<Suspense fallback={null}><Dashboards /></Suspense>} />}
                {/* Catch-all route for any undefined path */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
	);
}

export default App;
