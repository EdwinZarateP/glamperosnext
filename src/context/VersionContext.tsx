"use client";

import { createContext, useContext, useState } from "react";

type VersionMap = Record<string, number>;

interface VersionContextType {
    versions: VersionMap;
    setVersion: (sectionId: string, version: number) => void;
}

const VersionContext = createContext<VersionContextType | null>(null);

export function VersionProvider({ children }: { children: React.ReactNode }) {
    const [versions, setVersions] = useState<VersionMap>({});

    const setVersion = (sectionId: string, version: number) => {
        setVersions((prev) => ({ ...prev, [sectionId]: version }));
    };

    return (
        <VersionContext.Provider value={{ versions, setVersion }}>
            {children}
        </VersionContext.Provider>
    );
}

// export function useVersion(sectionId: string, totalVersions: number) {
export function useVersion(sectionId: string) {
    const ctx = useContext(VersionContext);
    if (!ctx) throw new Error("useVersion must be used inside VersionProvider");
    const current = ctx.versions[sectionId] ?? 0;
    const setVersion = (v: number) => ctx.setVersion(sectionId, v);
    // return { current, setVersion, totalVersions };
    return { current, setVersion };
}