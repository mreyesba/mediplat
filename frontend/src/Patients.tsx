import { useEffect, useId, useState } from "react";

interface EntryCount {
    count: number;
}

interface PatientsProps {
    user: { username: string; first_name: string } | null;
    setUser: (user: null) => void;
}

function Patients({ user, setUser }: PatientsProps) {
    // Generate accessible ID pairs automatically    
    const patientIdentifierId = useId();
    const patientFirstNameId = useId();
    const patientLastNameId = useId();
    const patientDobId = useId();
    const patientSexId = useId();
    
    const [isCreate, setIsCreate] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [sex, setSex] = useState('');
    const [count, setCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Login logic

    const handleCount = async (e) => {
        e.preventDefault();
        setErrorMessage('');
    
        try {
            const res = await fetch('/api/get_entry_count', { credentials: 'include', 
                                                              cache: 'no-store' });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
    
            const data: EntryCount = await res.json();
            setCount(data.count);
            
        } catch (error) {
            console.error("Count trigger failed:", error);
            setCount(0);
            setErrorMessage("Get count failed");
        }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        setErrorMessage('');
    
        try {
            const response = await fetch('/api/patient_register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ first_name: firstName, 
                                       last_name: lastName,
                                       dob,
                                       sex,
                                       identifier }),
            });
            
            if (response.ok) {
                window.location.reload(); // Reset state completely or route away
            } else {
                const err = await response.json();
                setErrorMessage(err.detail || 'Registration failed.');
            }
        } catch (err) {
            console.error('Failed to submit payload:', err);
        }
    };

    return (   
        <div>
        <h2>My patients</h2>

        {isCreate && 
        <div>
            <button
                onClick={() => {setIsCreate(!isCreate)}}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-50">
                Cancel
            </button>
            <form 
                className="flex flex-col gap-4 border p-4 rounded bg-white shadow-sm" 
                onSubmit={handleAddPatient}>
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h2 className="text-xl font-bold">
                        Add Patient
                    </h2>
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor={patientFirstNameId} 
                        className="text-sm font-semibold text-slate-700">
                        First Name
                    </label>
                    <input 
                        id={patientFirstNameId}
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500" 
                        required />
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor={patientLastNameId} 
                        className="text-sm font-semibold text-slate-700">
                        Last Name
                    </label>
                    <input 
                        id={patientLastNameId}
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500" 
                        required />
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor={patientDobId} 
                        className="text-sm font-semibold text-slate-700">
                        Date of birth
                    </label>
                    <input 
                        id={patientDobId}
                        type="date" 
                        value={dob} 
                        onChange={(e) => setDob(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500 w-full min-w-[200px] bg-white text-slate-800" 
                        required />
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor={patientSexId} 
                        className="text-sm font-semibold text-slate-700">
                        Sex
                    </label>
                    <select 
                        id={patientSexId}
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

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor={patientIdentifierId} 
                        className="text-sm font-semibold text-slate-700">
                        Unique identifier
                    </label>
                    <input 
                        id={patientIdentifierId}
                        type="text" 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        className="border rounded px-3 py-2 outline-sky-500" 
                        required />
                </div>

                <div className="flex gap-2 justify-end mt-2">
                    {errorMessage && (
                        <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                    )}
                    
                    <button 
                        type="submit" 
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-50">
                        Add patient
                    </button>
                </div>
            </form>         
        </div>
        }

        {!isCreate &&
        <div>
            <button
                onClick={() => {setIsCreate(!isCreate)}}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-50">
                Add new patient
            </button>
            <button
                onClick={handleCount}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-50">
                Refresh count
            </button>
            <p>
                These are my patients {count}
                {errorMessage}
            </p>
        </div>
        }
        </div>
    );
}

export default Patients;