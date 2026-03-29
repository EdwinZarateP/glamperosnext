"use client";

import { useVersion } from "@/context/VersionContext";
import styles from "./VersionSwitcher.module.css";

interface Props {
  sectionId: string;
  // totalVersions: number;
  labels?: string[]; // Ej: ["V1 Original", "V2 Nuevo", "V3 Minimal"]
}

// export default function VersionSwitcher({ sectionId, totalVersions, labels }: Props) {
export default function VersionSwitcher({ sectionId, labels }: Props) {
  // const { current, setVersion } = useVersion(sectionId, totalVersions);
  const { current, setVersion } = useVersion(sectionId);
  const totalVersionsCount = labels?.length || 1;

  return (
    <div className={styles.contenedor}>
      {/* {Array.from({ length: totalVersions }).map((_, i) => ( */}
      {Array.from({ length: totalVersionsCount }).map((_, i) => (
        <button
          key={i}
          onClick={() => setVersion(i)}
          title={labels?.[i] ?? `Versión ${i + 1}`}
          className={i === current ? styles.boton + " " + styles.activo : styles.boton}
        >
          {i === current ? (labels?.[i] ?? `V${i + 1}`) : ""}
        </button>
      ))}
    </div>
  );
}