import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import Home from './Home.tsx';
import About from './About.tsx';
import Account from './Account.tsx';
import Dashboards from './Dashboards.tsx';
import FormsPage from './FormsPage.tsx';
import { useAuth } from './AuthContext.tsx';
import Patients from './Patients.tsx';

// Simple Page Components
const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

function App() {
    const { user, setUser } = useAuth();

	return (
		<div>
			<Navbar user={user} setUser={setUser}/>

			{/* Page Display Area */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                {/* Nested Routes inside Account */}
                <Route path="/account" element={!user ? <Account /> : <Navigate to="/" replace />}>
                    <Route index element={<FormsPage type="login" />} />
                    {/* This renders at /account/profile */}
                    <Route path="login" element={<FormsPage type="login" />} />
                    {/* This renders at /account/settings */}
                    <Route path="signup" element={<FormsPage type="signup" />} />
                </Route>
                <Route path="/patients" element={<Patients user={user} setUser={setUser} />} />
                <Route path="/dashboards" element={<Dashboards />} />
                {/* Catch-all route for any undefined path */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
	);
}

export default App;
