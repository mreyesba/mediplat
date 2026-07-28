import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import Home from './Home.tsx';
import About from './About.tsx';
import Account from './Account.tsx';
import Dashboards from './Dashboards.tsx';
import FormsPage from './FormsPage.tsx';

// Simple Page Components
const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

function App() {

	return (
		<BrowserRouter>
			<Navbar />

			{/* Page Display Area */}
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
		</BrowserRouter>
	);
}

export default App;
