import { useEffect, useState, useMemo } from "react";
import type { Patient } from "./types";
import { CreatePatientForm } from "./CreatePatientForm";
import { PatientDetailView } from "./PatientDetailView";

function Patients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchPatients = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch("/api/get_patients", {
                credentials: "include",
                cache: "no-store",
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data: Patient[] = await res.json();
            setPatients(data);

            // Auto-select first patient if none selected
            if (data.length > 0 && !selectedIdentifier) {
                setSelectedIdentifier(data[0].identifier);
            }
        } catch (error) {
            console.error("Patients retrieval failed:", error);
            setPatients([]);
            setErrorMessage("Failed to fetch patients.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        if (!term) return patients;
        
        return patients.filter(
            (p) =>
            p.first_name.toLowerCase().includes(term) ||
            p.last_name.toLowerCase().includes(term) ||
            p.identifier.toLowerCase().includes(term)
        );              
    }, [patients, searchTerm]);

    const selectedPatient = patients.find((p) => p.identifier === selectedIdentifier);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
            {/* MAIN PANEL */}
            <main className="flex-1 flex flex-col h-full overflow-hidden border-r">
            {/* Top Bar */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
                <h1 className="text-xl font-bold text-slate-800">Patient Dashboard</h1>
                <button
                onClick={() => setIsCreating(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
                >
                + Add New Patient
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                {isCreating ? (
                <CreatePatientForm
                    onSuccess={() => {
                    setIsCreating(false);
                    fetchPatients();
                    }}
                    onCancel={() => setIsCreating(false)}
                />
                ) : selectedPatient ? (
                <PatientDetailView
                    patient={selectedPatient}
                    onRefreshData={fetchPatients}
                />
                ) : (
                <div className="text-center text-slate-400 py-12">
                    {isLoading ? "Loading patients..." : "No patient selected."}
                </div>
                )}
            </div>
            </main>

            {/* SIDEBAR: PATIENT LIST */}
            <aside className="w-80 bg-white flex flex-col h-full border-l">
            <div className="p-4 border-b space-y-3">
                <input
                type="text"
                placeholder="Search patient or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-sky-500"
                />
                {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
            </div>

            <div className="flex-1 overflow-y-auto divide-y">
                {filteredPatients.map((patient) => {
                const isSelected = patient.identifier === selectedIdentifier;
                return (
                    <button
                    key={patient.identifier}
                    onClick={() => {
                        setSelectedIdentifier(patient.identifier);
                        setIsCreating(false);
                    }}
                    className={`w-full text-left p-4 transition flex flex-col gap-1 ${
                        isSelected ? "bg-sky-50 border-l-4 border-sky-600" : "hover:bg-slate-50"
                    }`}
                    >
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-800">
                        {patient.first_name} {patient.last_name}
                        </span>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {patient.entries.length} entries
                        </span>
                    </div>
                    <span className="text-xs text-slate-400">ID: {patient.identifier}</span>
                    </button>
                );
                })}
            </div>
            </aside>
        </div>
    );
}

export default Patients;