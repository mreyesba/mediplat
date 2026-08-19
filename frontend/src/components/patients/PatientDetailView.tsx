import React from "react";
import type { Patient } from "./types";
import { CreateEntryForm } from "./CreateEntryForm";

interface PatientDetailViewProps {
  patient: Patient;
  onRefreshData: () => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onRefreshData,
}) => {
    return (
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Patient Header */}
            <div className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                {patient.first_name} {patient.last_name}
                </h2>
                <div className="flex gap-4 text-xs text-slate-500 mt-1">
                <span>ID: <strong className="text-slate-700">{patient.identifier}</strong></span>
                <span>DOB: <strong className="text-slate-700">{patient.dob}</strong></span>
                <span>Sex: <strong className="text-slate-700 uppercase">{patient.sex}</strong></span>
                </div>
            </div>
            </div>

            {/* Add New Entry */}
            <CreateEntryForm
            patientIdentifier={patient.identifier}
            onEntryAdded={onRefreshData}
            />

            {/* Entry History */}
            <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                History ({patient.entries.length} {patient.entries.length === 1 ? "entry" : "entries"})
            </h3>

            {patient.entries.length === 0 ? (
                <div className="bg-white border border-dashed rounded-xl p-6 text-center text-slate-400 text-sm">
                No clinical entries recorded for this patient yet.
                </div>
            ) : (
                patient.entries.map((entry) => (
                <div key={entry.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400 border-b pb-2">
                    <span>Entry #{entry.id}</span>
                    <span>
                        {new Date(entry.created_at).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                        })}
                    </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {entry.info}
                    </p>
                </div>
                ))
            )}
            </div>
        </div>
    );
};