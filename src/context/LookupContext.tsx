import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '@/src/api/api';

// 1. Define the shape of a single lookup option
export interface LookupOption {
    label: string;
    value: string;
    parent?: string | null;
    description?: string | null;
}

// 2. Define the shape of our entire lookup state
interface LookupData {
    religion: LookupOption[];
    community: LookupOption[];
    mother_tongue: LookupOption[];
    marital_status: LookupOption[];
    income_range: LookupOption[];
    state: LookupOption[];
    employment_sector: LookupOption[];
    designation: LookupOption[];
    role: LookupOption[];
    church_branches: LookupOption[];
    sub_community: LookupOption[];
    occupation: LookupOption[];
    siblings: LookupOption[];
    financial_status: LookupOption[];
    financial_details: LookupOption[];
    country: LookupOption[];
    hobbies: LookupOption[];
    appName: string;
    appVersion: string;
    appLogo: string;
}

// 3. Define the Context's return type
interface LookupContextType {
    lookups: LookupData;
    isReady: boolean;

    refreshLookups: () => Promise<void>;
}

// 4. Initialize with types to fix the "ts(2339)" error
export const LookupContext = createContext<LookupContextType>({
    lookups: {
        religion: [],
        community: [],
        mother_tongue: [],
        marital_status: [],
        income_range: [],
        state: [],
        employment_sector: [],
        designation: [],
        role: [],
        church_branches: [],
        sub_community: [],
        occupation: [],
        siblings: [],
        financial_status: [],
        financial_details: [],
        country: [],
        hobbies: [],
        appName: '',
        appVersion: '',
        appLogo: ''
    },

    isReady: false,
    refreshLookups: async () => { },
});

export const LookupProvider = ({ children }: { children: ReactNode }) => {
    const [lookups, setLookups] = useState<LookupData>({
        religion: [],
        community: [],
        mother_tongue: [],
        marital_status: [],
        income_range: [],
        state: [],
        employment_sector: [],
        designation: [],
        role: [],
        church_branches: [],
        sub_community: [],
        occupation: [],
        siblings: [],
        financial_status: [],
        financial_details: [],
        country: [],
        hobbies: [],
        appName: '',
        appVersion: '',
        appLogo: ''
    });
    const [isReady, setIsReady] = useState(false);

    const fetchLookups = async () => {
        try {
            // Updated to a bulk helper endpoint that returns all MasterIDs
            const res = await api.get('/helpers/lookups.php');
            console.log('lookups=======', res.data);
            if (res.data.success) {
                let item = {
                    ...res.data.data,
                    appName: res?.data?.appName,
                    appVersion: res?.data?.appVersion,
                    appLogo: res?.data?.appLogo
                }
                setLookups(item);
                setIsReady(true);
            }
        } catch (err) {
            console.error("Lookup Boot Error :", err);
        }
    };

    useEffect(() => {
        fetchLookups();
    }, []);

    return (
        <LookupContext.Provider value={{ lookups, isReady, refreshLookups: fetchLookups }}>
            {children}
        </LookupContext.Provider>
    );
};