import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import type { Patient } from "./types";
import { CreatePatientForm } from "./CreatePatientForm";
import { PatientDetailView } from "./PatientDetailView";
import { API_BASE_URL } from "../../apiConfig";

const lastEntryDate = (patient: Patient) =>
    patient.entries.reduce<Date | null>((latest, entry) => {
        const created = new Date(entry.created_at);
        return !latest || created > latest ? created : latest;
    }, null);

function Patients() {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.resolvedLanguage === "es" ? es : enUS;
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    // Phones show either the patient list or the main panel, never both
    const [showListOnMobile, setShowListOnMobile] = useState(true);

    const startCreating = () => {
        setIsCreating(true);
        setShowListOnMobile(false);
    };

    const fetchPatients = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/get_patients`, {
                credentials: "include"
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
            setErrorMessage(t('patients.fetchFailed'));
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
            <main className={`${showListOnMobile ? "hidden md:flex" : "flex"} flex-1 flex-col h-full overflow-hidden border-r`}>
            {/* Top Bar */}
            <div className="bg-white border-b px-4 md:px-6 flex justify-between items-center gap-2 shadow-sm">
                <button
                    type="button"
                    onClick={() => setShowListOnMobile(true)}
                    className="md:hidden py-3 text-sm font-medium text-sky-600"
                >
                    ‹ {t('patients.backToList')}
                </button>
                <h1 className="hidden md:block text-xl font-bold text-slate-800">{t('patients.title')}</h1>
                <button
                onClick={startCreating}
                className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
                >
                {t('patients.addNew')}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isCreating ? (
                <CreatePatientForm
                    onSuccess={() => {
                    setIsCreating(false);
                    fetchPatients();
                    }}
                    onCancel={() => {
                    setIsCreating(false);
                    setShowListOnMobile(true);
                    }}
                />
                ) : selectedPatient ? (
                <PatientDetailView
                    key={selectedPatient.identifier}
                    patient={selectedPatient}
                    onRefreshData={fetchPatients}
                />
                ) : (
                <div className="text-center text-slate-400 py-12">
                    {isLoading ? t('patients.loading') : t('patients.noneSelected')}
                </div>
                )}
            </div>
            </main>

            {/* SIDEBAR: PATIENT LIST */}
            <aside className={`${showListOnMobile ? "flex" : "hidden md:flex"} w-full md:w-80 bg-white flex-col h-full border-l`}>
            <div className="p-4 border-b space-y-3">
                {/* Phones: the main panel (with its title bar) is hidden while the list shows */}
                <div className="md:hidden flex justify-between items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-800 m-0">{t('patients.title')}</h1>
                    <button
                        onClick={startCreating}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-3 py-2 rounded-lg text-sm transition"
                    >
                        {t('patients.addNew')}
                    </button>
                </div>
                <input
                type="text"
                placeholder={t('patients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-sky-500"
                />
                {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
            </div>

            <div className="flex-1 overflow-y-auto divide-y">
                {filteredPatients.map((patient) => {
                const isSelected = patient.identifier === selectedIdentifier;
                const lastEntry = lastEntryDate(patient);
                return (
                    <button
                    key={patient.identifier}
                    onClick={() => {
                        setSelectedIdentifier(patient.identifier);
                        setIsCreating(false);
                        setShowListOnMobile(false);
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
                        {t('patients.entries', { count: patient.entries.length })}
                        </span>
                    </div>
                    <span className="text-xs text-slate-400">{t('patients.idLabel')}: {patient.identifier}</span>
                    {lastEntry && (
                        <span className="text-xs text-slate-400" title={lastEntry.toLocaleString()}>
                        {t('patients.lastEntry', {
                            when: formatDistanceToNow(lastEntry, { addSuffix: true, locale: dateLocale }),
                        })}
                        </span>
                    )}
                    </button>
                );
                })}
            </div>
            </aside>
        </div>
    );
}

export default Patients;