"use client";

import { useVersion } from "@/context/VersionContext";

interface Props {
  sectionId: string;
  totalVersions: number;
  labels?: string[]; // Ej: ["V1 Original", "V2 Nuevo", "V3 Minimal"]
}

export default function VersionSwitcher({ sectionId, totalVersions, labels }: Props) {
  const { current, setVersion } = useVersion(sectionId, totalVersions);

  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "999px",
        padding: "6px 12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {Array.from({ length: totalVersions }).map((_, i) => (
        <button
          key={i}
          onClick={() => setVersion(i)}
          title={labels?.[i] ?? `Versión ${i + 1}`}
          style={{
            width: i === current ? "auto" : "10px",
            height: "10px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: i === current ? "#6C63FF" : "#cbd5e1",
            padding: i === current ? "0 10px" : "0",
            fontSize: "12px",
            color: "white",
            fontWeight: 500,
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          {i === current ? (labels?.[i] ?? `V${i + 1}`) : ""}
        </button>
      ))}
    </div>
  );
}