import './FormsPage.css';
import { useState } from 'react';

interface FormsPageProps {
  type: 'login' | 'signup';
}

function FormsPage({ type }: FormsPageProps) {
    // Global form states

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [sex, setSex] = useState('');

    // Multistep view tracker (Starts at step 1)
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Signup state routing logic

    const handleNextStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            if (step === 1) {
                // Step 1: Validate Email existence
                const response = await fetch('/api/validate_email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email }),
                });
                
                if (response.ok) {
                    setStep(2); // Advance to username choice
                } else {
                    const err = await response.json();
                    alert(err.detail);
                }
            } else if (step === 2) {
                // Step 2: Validate Username availability
                const response = await fetch('/api/validate_user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ username }),
                });
                
                if (response.ok) {
                    setStep(3); // Advance to account creation
                } else {
                    const err = await response.json();
                    alert(err.detail);
                }
            } else if (step === 3) {
                // Step 3: Send entire package to save to SQLite database
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, 
                                           username, 
                                           password, 
                                           first_name: firstName, 
                                           last_name: lastName,
                                           dob,
                                           sex }),
                });
                
                if (response.ok) {
                    alert('Account created successfully! Please log in.');
                    window.location.reload(); // Reset state completely or route away
                } else {
                    const err = await response.json();
                    alert(err.detail);
                }
            }
        } catch (err) {
            console.error('Network pipeline crash:', err);
        } finally {
            setLoading(false);
        }
    };


    // Login logic

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });
        
            if (response.ok) {
                const data = await response.json();
                alert(`Welcome back, ${data.username}! You are securely logged in.`);

                setUsername('');
                setPassword('');

                // If you want to check if the cookie works, query the private /api/me path instantly:
                const profileRes = await fetch('/api/me', { credentials: 'include' });
                const profileData = await profileRes.json();
                console.log("Logged-In Profile Context:", profileData);
            } else {
                const err = await response.json();
                alert(`Login failed: ${err.detail}`);
            }
        } catch (err) {
            console.error('Failed to submit payload:', err);
        }
    };

    // View rendering engine

    if (type === 'login') {
        return (
            <form 
                className="flex flex-col gap-4 border p-4 rounded bg-white shadow-sm" 
                onSubmit={handleLoginSubmit}>
                <h2 className="text-xl font-bold">Welcome Back</h2>
                <div className="flex flex-col gap-1">
                    <label 
                        className="text-sm font-semibold text-slate-700">
                        Username
                    </label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="border rounded px-3 py-2" required />
                </div>
                <div className="flex flex-col gap-1">
                    <label 
                        className="text-sm font-semibold text-slate-700">
                        Password
                    </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="border rounded px-3 py-2" 
                        required />
                </div>
                <button 
                    type="submit" 
                    className="bg-sky-600 text-white font-bold py-2 rounded">
                    Log in
                </button>
            </form>
        );
    }

    // Multi-Step Sign Up Forms Rendering Layout
    return (
        <form 
            className="flex flex-col gap-4 border p-4 rounded bg-white shadow-sm" 
            onSubmit={handleNextStep}>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
                <h2 className="text-xl font-bold">
                    Create Account
                </h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                    Step {step} of 3
                </span>
            </div>

            {step >= 1 && (
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">
                    Enter Email Address
                    </label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="border rounded px-3 py-2 outline-sky-500" 
                    disabled={step > 1}
                    required />
            </div>
            )}

            {step >= 2 && (
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">
                    Choose an Available Username
                </label>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="border rounded px-3 py-2 outline-sky-500" 
                    disabled={step > 2}
                    required />
            </div>
            )}

            {step === 3 && (
            <div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">
                        Secure Your Password
                    </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500" 
                        required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">
                        First Name
                    </label>
                    <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500" 
                        required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">
                        Last Name
                    </label>
                    <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500" 
                        required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">
                        Date of birth
                    </label>
                    <input 
                        type="date" 
                        value={dob} 
                        onChange={(e) => setDob(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500 w-full min-w-[200px] bg-white text-slate-800" 
                        required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">
                        Sex
                    </label>
                    <select 
                        value={sex} 
                        onChange={(e) => setSex(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500 bg-white"
                        required>
                        <option value="">Select Option...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="prefer_not_to_say">Prefer Not To Say</option>
                    </select>
                </div>
            </div>
            )}

            <div className="flex gap-2 justify-end mt-2">
            {step > 1 && (
                <button 
                    type="button" 
                    onClick={() => setStep(step - 1)} 
                    className="border px-4 py-2 rounded text-sm hover:bg-slate-50">
                    Back
                </button>
            )}
            <button 
                type="submit" 
                disabled={loading} 
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-50">
                {loading ? 'Verifying...' : step === 3 ? 'Complete Sign Up' : 'Continue'}
            </button>
            </div>
        </form>
    );
}

export default FormsPage;