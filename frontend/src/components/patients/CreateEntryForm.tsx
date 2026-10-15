import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../apiConfig";
import type { Entry } from "./types";
import rawTextContentEs from '../../assets/entry_templates/template_es.txt?raw';
import rawTextContentEn from '../../assets/entry_templates/template_en.txt?raw';

const templates: Record<string, string> = {
    es: rawTextContentEs,
    en: rawTextContentEn,
};

interface CreateEntryFormProps {
    patientIdentifier: string;
    // When set, the form shows this entry read-only instead of creating a new one
    entry?: Entry;
    onEntryAdded?: () => void;
    onCancel: () => void;
}

export const CreateEntryForm: React.FC<CreateEntryFormProps> = ({
    patientIdentifier,
    entry,
    onEntryAdded,
    onCancel,
}) => {
    const { t, i18n } = useTranslation();
    const readOnly = entry !== undefined;
    const [info, setInfo] = useState(entry?.info ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (readOnly || !info.trim() || isSubmitting) return;

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
                onEntryAdded?.();
            } else {
            const err = await response.json();
                setError(err.detail || t('patients.entryForm.addFailed'));
            }
        } catch (err) {
            console.error("Failed to post entry:", err);
            setError(t('patients.entryForm.networkError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const onAddTemplate = () => {
        setInfo(templates[i18n.resolvedLanguage ?? "en"] ?? templates.en);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex justify-between items-center border-b px-6 py-4 shrink-0">
                <div className="text-left">
                    <h2 className="text-lg font-bold text-slate-800">
                        {readOnly
                            ? t('patients.detail.entryNumber', { id: entry.id })
                            : t('patients.entryForm.title')}
                    </h2>
                    {readOnly && (
                        <p className="text-xs text-slate-400">
                            {new Date(entry.created_at).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none disabled:opacity-50"
                    aria-label={t('patients.entryForm.close')}
                >
                    &times;
                </button>
            </div>

            {!readOnly && (
                <div className="flex min-h-0 px-6 py-4 shrink-0">
                        <button
                            type="button"
                            onClick={onAddTemplate}
                            disabled={info !== ""}
                            className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {t('patients.entryForm.addTemplate')}
                        </button>
                </div>
            )}

            <div className="flex-1 min-h-0 px-6 py-4">
                <textarea
                    autoFocus={!readOnly}
                    readOnly={readOnly}
                    value={info}
                    onChange={(e) => setInfo(e.target.value)}
                    placeholder={readOnly ? undefined : t('patients.entryForm.placeholder')}
                    className={`w-full h-full p-4 border rounded-lg text-sm text-left leading-relaxed outline-none resize-none ${
                        readOnly ? "bg-slate-50 text-slate-700" : "focus:ring-2 focus:ring-sky-500"
                    }`}
                    required={!readOnly}
                />
            </div>

            <div className="flex justify-between items-center border-t px-6 py-4 shrink-0">
                <p className="text-xs text-red-600">{error}</p>
                {readOnly ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                    >
                        {t('patients.entryForm.close')}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onCancel}
                            className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {t('patients.entryForm.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !info.trim()}
                            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition"
                        >
                            {isSubmitting ? t('patients.entryForm.saving') : t('patients.entryForm.submit')}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};
