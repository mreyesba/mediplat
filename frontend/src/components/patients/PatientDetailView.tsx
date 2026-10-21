import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Entry, Patient } from "./types";
import { CreateEntryForm } from "./CreateEntryForm";

interface PatientDetailViewProps {
  patient: Patient;
  onRefreshData: () => void;
}

// dob arrives as "YYYY-MM-DD"; parse it by hand so the timezone can't shift the day
const calculateAge = (dob: string) => {
    const [year, month, day] = dob.split("-").map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    const birthdayPassed =
        today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
    if (!birthdayPassed) age--;
    return age;
};

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onRefreshData,
}) => {
    const { t } = useTranslation();
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
    const [entrySearch, setEntrySearch] = useState("");

    // Newest first; the API doesn't guarantee an order
    const sortedEntries = useMemo(
        () =>
            [...patient.entries].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id - a.id
            ),
        [patient.entries]
    );

    const filteredEntries = useMemo(() => {
        const term = entrySearch.toLowerCase().trim();
        if (!term) return sortedEntries;
        return sortedEntries.filter((entry) => entry.info.toLowerCase().includes(term));
    }, [sortedEntries, entrySearch]);

    // Older/newer navigation follows the list as currently shown (including the search filter)
    const selectedIndex = selectedEntry
        ? filteredEntries.findIndex((entry) => entry.id === selectedEntry.id)
        : -1;
    const olderEntry = selectedIndex >= 0 ? filteredEntries[selectedIndex + 1] : undefined;
    const newerEntry = selectedIndex > 0 ? filteredEntries[selectedIndex - 1] : undefined;

    const closeModal = () => {
        setIsAddingEntry(false);
        setSelectedEntry(null);
    };

    return (
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Patient Header */}
            <div className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-start">
            <div>
                <h2 className="flex text-2xl font-bold text-slate-900">
                {patient.first_name} {patient.last_name}
                </h2>
                <div className="flex gap-4 text-xs text-slate-500 mt-1">
                <span>{t('patients.detail.id')}: <strong className="text-slate-700">{patient.identifier}</strong></span>
                <span>{t('patients.detail.dob')}: <strong className="text-slate-700">{patient.dob}</strong></span>
                <span>{t('patients.detail.age')}: <strong className="text-slate-700">{calculateAge(patient.dob)}</strong></span>
                <span>{t('patients.detail.sex')}: <strong className="text-slate-700 uppercase">{patient.sex}</strong></span>
                </div>
            </div>
            <button
                onClick={() => setIsAddingEntry(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shrink-0"
            >
                {t('patients.detail.addEntry')}
            </button>
            </div>

            {(isAddingEntry || selectedEntry) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[85vh] max-w-5xl flex flex-col overflow-hidden">
                        <CreateEntryForm
                            key={selectedEntry?.id ?? "new"}
                            patientIdentifier={patient.identifier}
                            entry={selectedEntry ?? undefined}
                            previousInfo={sortedEntries[0]?.info}
                            onOlder={olderEntry ? () => setSelectedEntry(olderEntry) : undefined}
                            onNewer={newerEntry ? () => setSelectedEntry(newerEntry) : undefined}
                            onEntryAdded={() => {
                                closeModal();
                                onRefreshData();
                            }}
                            onCancel={closeModal}
                        />
                    </div>
                </div>
            )}

            {/* Entry History */}
            <div className="space-y-3">
            <div className="flex justify-between items-center gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('patients.detail.history', { count: patient.entries.length })}
                </h3>
                {patient.entries.length > 0 && (
                    <input
                        type="search"
                        value={entrySearch}
                        onChange={(e) => setEntrySearch(e.target.value)}
                        placeholder={t('patients.detail.searchEntries')}
                        className="w-64 px-3 py-1.5 border rounded-lg text-sm bg-white outline-sky-500"
                    />
                )}
            </div>

            {patient.entries.length === 0 ? (
                <div className="bg-white border border-dashed rounded-xl p-6 text-center text-slate-400 text-sm">
                {t('patients.detail.noEntries')}
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="bg-white border border-dashed rounded-xl p-6 text-center text-slate-400 text-sm">
                {t('patients.detail.noMatches', { term: entrySearch.trim() })}
                </div>
            ) : (
                filteredEntries.map((entry) => (
                <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left bg-white p-4 rounded-xl border shadow-sm hover:border-sky-300 hover:bg-sky-50/40 transition"
                >
                    <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{t('patients.detail.entryNumber', { id: entry.id })}</span>
                    <span>
                        {new Date(entry.created_at).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                        })}
                    </span>
                    </div>
                </button>
                ))
            )}
            </div>
        </div>
    );
};
