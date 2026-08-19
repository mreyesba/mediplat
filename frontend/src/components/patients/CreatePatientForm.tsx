import React, { useState, useId } from "react";

interface CreatePatientFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreatePatientForm: React.FC<CreatePatientFormProps> = ({
    onSuccess,
    onCancel,
}) => {
    const patientFirstNameId = useId();
    const patientLastNameId = useId();
    const patientDobId = useId();
    const patientSexId = useId();
    const patientIdentifierId = useId();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");
    const [sex, setSex] = useState("");
    const [identifier, setIdentifier] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/patient_register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    dob,
                    sex,
                    identifier,
                }),
            });

            if (response.ok) {
                onSuccess();
            } else {
                const err = await response.json();
                setErrorMessage(err.detail || "Registration failed.");
            }
        } catch (err) {
            console.error("Failed to submit patient:", err);
            setErrorMessage("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm max-w-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-slate-800">Add New Patient</h2>
            <button
                type="button"
                onClick={onCancel}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium">
                Cancel
            </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                <label htmlFor={patientFirstNameId} className="text-xs font-semibold text-slate-700">
                    First Name
                </label>
                <input
                    id={patientFirstNameId}
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm outline-sky-500"
                    required />
                </div>

                <div className="flex flex-col gap-1">
                <label htmlFor={patientLastNameId} className="text-xs font-semibold text-slate-700">
                    Last Name
                </label>
                <input
                    id={patientLastNameId}
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm outline-sky-500"
                    required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                <label htmlFor={patientDobId} className="text-xs font-semibold text-slate-700">
                    Date of Birth
                </label>
                <input
                    id={patientDobId}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm outline-sky-500 bg-white"
                    required />
                </div>

                <div className="flex flex-col gap-1">
                <label htmlFor={patientSexId} className="text-xs font-semibold text-slate-700">
                    Sex
                </label>
                <select
                    id={patientSexId}
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm outline-sky-500 bg-white"
                    required>
                    <option value="">Select Option...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">Prefer Not To Say</option>
                </select>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor={patientIdentifierId} className="text-xs font-semibold text-slate-700">
                    Unique Identifier (MRN / ID)
                </label>
                <input
                    id={patientIdentifierId}
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm outline-sky-500"
                    placeholder="e.g., P-10042"
                    required />
            </div>

            {errorMessage && (
                <p className="text-sm text-red-600 font-medium mt-1">{errorMessage}</p>
            )}

            <div className="flex gap-2 justify-end mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-lg text-sm transition">
                    {isSubmitting ? "Saving..." : "Add Patient"}
                </button>
            </div>
            </form>
        </div>
    );
};