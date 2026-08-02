import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import Home from './Home.tsx';
import About from './About.tsx';
import Account from './Account.tsx';
import Dashboards from './Dashboards.tsx';
import FormsPage from './FormsPage.tsx';
import { useState, useEffect } from 'react';

// Simple Page Components
const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

function App() {
    const [user, setUser] = useState(null); // Stores { username, first_name } if logged in
    // const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
    // Ping the backend profile endpoint automatically on load/refresh
    fetch('/api/me', { credentials: 'include' })
        .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
            return res.json();
        })
        .then((profileData) => {
            setUser(profileData); // Active session confirmed!
            // setCheckingSession(false);
        })
        .catch(() => {
            setUser(null); // No cookie or expired token found
            // setCheckingSession(false);
        });
    }, []);

	return (
		<>
			<Navbar user={user} setUser={setUser}/>

			{/* Page Display Area */}
            {user ? (
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/dashboards" element={<Dashboards />} />
                    {/* Catch-all route for any undefined path */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            ) : (
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    {/* Nested Routes inside Account */}
                    <Route path="/account" element={<Account />}>
                        <Route index element={<FormsPage type="login" />} />
                        {/* This renders at /account/profile */}
                        <Route path="login" element={<FormsPage type="login" />} />
                        {/* This renders at /account/settings */}
                        <Route path="signup" element={<FormsPage type="signup" />} />
                    </Route>
                    <Route path="/dashboards" element={<Dashboards />} />
                    {/* Catch-all route for any undefined path */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>	
            )}
        </>
	);
}

export default App;
