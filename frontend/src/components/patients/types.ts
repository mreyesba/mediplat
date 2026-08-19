export interface Entry {
    id: number;
    provider_identifier: number;
    created_at: string;
    info: string;
}

export interface Patient {
    identifier: string;
    first_name: string;
    last_name: string;
    dob: string;
    sex: string;
    entries: Entry[];
}

export interface NewPatientPayload {
    identifier: string;
    first_name: string;
    last_name: string;
    dob: string;
    sex: string;
}