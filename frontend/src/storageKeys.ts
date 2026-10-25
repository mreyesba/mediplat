// Every key the app reads or writes in browser storage, in one place so they
// can't collide and are easy to find. Changing a value orphans whatever
// browsers already stored under the old one.

// localStorage: the chosen UI language. Matches i18next's default name, so
// language choices saved before this file existed still apply.
export const LANGUAGE_KEY = 'i18nextLng';

// sessionStorage: the unsent text of a new entry, per patient
export const entryDraftKey = (patientIdentifier: string) => `entryDraft:${patientIdentifier}`;
