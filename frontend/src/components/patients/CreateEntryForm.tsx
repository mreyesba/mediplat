import React, { useState } from "react";

interface CreateEntryFormProps {
    patientIdentifier: string;
    onEntryAdded: () => void;
}

export const CreateEntryForm: React.FC<CreateEntryFormProps> = ({
    patientIdentifier,
    onEntryAdded,
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
            const response = await fetch("/api/add_entry", {
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
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                New Clinical Entry
            </h4>
            <textarea
                rows={3}
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="Record clinical notes, observations, or updates..."
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                required />
                {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end">
            <button
                type="submit"
                disabled={isSubmitting || !info.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition" >
                {isSubmitting ? "Saving..." : "Save Entry"}
            </button>
            </div>
        </form>
    );
};