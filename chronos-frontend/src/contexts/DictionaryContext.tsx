// contexts/DictionaryContext.tsx
'use client';

import { createContext, useContext } from 'react';
import type { Dictionary } from '@/lib/dictionary';

type DictionaryContextType = {
    dict: Dictionary;
    lang: string;
};

const DictionaryContext = createContext<DictionaryContextType | null>(null);

export function DictionaryProvider({
    children,
    dict,
    lang,
}: {
    children: React.ReactNode;
    dict: Dictionary;
    lang: string;
}) {
    return (
        <DictionaryContext.Provider value={{ dict, lang }}>
            {children}
        </DictionaryContext.Provider>
    );
}

export function useDictionary() {
    const context = useContext(DictionaryContext);
    if (!context) {
        throw new Error(
            'useDictionary must be used within a DictionaryProvider',
        );
    }
    return context;
}
