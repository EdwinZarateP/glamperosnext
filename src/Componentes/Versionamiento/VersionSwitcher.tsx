"use client";

import { useState, useEffect, useRef } from "react";
import { useVersion } from "@/context/VersionContext";
import ChevronIcon from '@/Componentes/ui/icons/ChevronIcon';
import styles from "./VersionSwitcher.module.css";

interface Props {
  sectionId: string;
  // totalVersions: number;
  labels?: string[]; // Ej: ["V1 Original", "V2 Nuevo", "V3 Minimal"]
}

export default function VersionSwitcher({ sectionId, labels }: Props) {
  const { current, setVersion } = useVersion(sectionId);
  // const { current, setVersion } = useVersion(sectionId, totalVersions);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const totalVersionsCount = labels?.length || 1;

  const getLabel = (i: number) => labels?.[i] ?? `V${i + 1}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={styles.contenedor}>
      {/* Botón trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={styles.botonPrincipal}
      >
        {getLabel(current)}
        <ChevronIcon open={open} />
      </button>

      {/* Menú desplegable */}
      {open && (
        <div
          className={styles.menuDesplegable}
        >
          {Array.from({ length: totalVersionsCount }).map((_, i) => (
            <div key={i}>
              <button
                onClick={() => { setVersion(i); setOpen(false); }}
                className={styles.botonListado}
                style={{
                  fontWeight: i === current ? 500 : 400,
                  color: i === current ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                }}
              >
                <span
                  className={styles.indicadorBotonListado}
                  style={{
                    background: i === current ? "#534AB7" : "var(--color-border-secondary, #d1d5db)",
                  }}
                />

                {getLabel(i)}
              </button>
              {i < totalVersionsCount - 1 && (
                <div className={styles.lineaSeparadora} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}