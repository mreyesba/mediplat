import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Simple Page Components
const Home = () => <h2>🏠 Home Page</h2>;
const About = () => <h2>ℹ️ About Page</h2>;
const Contact = () => <h2>📞 Contact Page</h2>;
const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

function Navbar() {
  return (
    <nav className="top-menu flex items-center justify-between p-4 bg-slate-900 text-white">
      {/* Logo / Brand */}
      <div className="font-bold text-xl">MyBrand</div>

      {/* Navigation Links */}
      <div className="flex gap-6">
        <Link to="/" className="hover:text-sky-400 transition-colors">Home</Link>
        <Link to="/about" className="hover:text-sky-400 transition-colors">About</Link>
        <Link to="/contact" className="hover:text-sky-400 transition-colors">Contact</Link>
      </div>
    </nav>
  )
}

function App2() {

  return (
    <BrowserRouter>
    {Navbar()}

    {/* Page Display Area */}
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* Catch-all route for any undefined path */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  </BrowserRouter>
  )
}

export default App2
