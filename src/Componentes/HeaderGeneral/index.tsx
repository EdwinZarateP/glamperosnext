// components/HeaderGeneral.tsx

// "use client"

import React from 'react';

interface HeaderGeneralProps {
  fechaInicio: string;
  fechaFin: string;
  totalHuespedes: number;
  onFechaInicioChange: (value: string) => void;
  onFechaFinChange: (value: string) => void;
  onTotalHuespedesChange: (value: number) => void;
  onBuscar: () => void;
}

export default function HeaderGeneral({
  fechaInicio,
  fechaFin,
  totalHuespedes,
  onFechaInicioChange,
  onFechaFinChange,
  onTotalHuespedesChange,
  onBuscar
}: HeaderGeneralProps) {
  return (
    <div className="TarjetasEcommerce-search-controls">
      <label>
        Fecha inicio:
        <input
          type="date"
          value={fechaInicio}
          onChange={e => onFechaInicioChange(e.target.value)}
        />
      </label>
      <label>
        Fecha fin:
        <input
          type="date"
          value={fechaFin}
          onChange={e => onFechaFinChange(e.target.value)}
        />
      </label>
      <label>
        Huéspedes:
        <input
          type="number"
          min={1}
          value={totalHuespedes}
          onChange={e => onTotalHuespedesChange(Number(e.target.value))}
        />
      </label>
      <button
        className="TarjetasEcommerce-search-btn"
        onClick={onBuscar}
      >
        Buscar
      </button>
    </div>
  );
}

