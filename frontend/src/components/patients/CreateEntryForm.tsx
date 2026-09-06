import React, { useState } from "react";
import { API_BASE_URL } from "../../apiConfig";

interface CreateEntryFormProps {
    patientIdentifier: string;
    onEntryAdded: () => void;
    onCancel: () => void;
}

export const CreateEntryForm: React.FC<CreateEntryFormProps> = ({
    patientIdentifier,
    onEntryAdded,
    onCancel,
}) => {
    const [info, setInfo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!info.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/add_entry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                patient_identifier: patientIdentifier,
                info,
            }),
            });

            if (response.ok) {
                setInfo("");
                onEntryAdded();
            } else {
            const err = await response.json();
                setError(err.detail || "Failed to add entry.");
            }
        } catch (err) {
            console.error("Failed to post entry:", err);
            setError("Network error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center border-b px-6 py-4 shrink-0">
                <h2 className="text-lg font-bold text-slate-800">New Clinical Entry</h2>
                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none disabled:opacity-50"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>

            <div className="flex-1 min-h-0 px-6 py-4">
                <textarea
                    autoFocus
                    value={info}
                    onChange={(e) => setInfo(e.target.value)}
                    placeholder="Record clinical notes, observations, or updates..."
                    className="w-full h-full p-4 border rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                    required
                />
            </div>

            <div className="flex justify-between items-center border-t px-6 py-4 shrink-0">
                <p className="text-xs text-red-600">{error}</p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !info.trim()}
                        className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition"
                    >
                        {isSubmitting ? "Saving..." : "Save Entry"}
                    </button>
                </div>
            </div>
        </form>
    );
};
