'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import './estilos.css';

interface ModalTelefonoProps {
  email: string;
  onClose(): void;
  onSaved(newPhone: string): void;
}

const PAISES = [
  { code: '54', label: 'Argentina (+54)' },
  { code: '591', label: 'Bolivia (+591)' },
  { code: '55', label: 'Brasil (+55)' },
  { code: '56', label: 'Chile (+56)' },
  { code: '57', label: 'Colombia (+57)' },
  { code: '506', label: 'Costa Rica (+506)' },
  { code: '53', label: 'Cuba (+53)' },
  { code: '593', label: 'Ecuador (+593)' },
  { code: '503', label: 'El Salvador (+503)' },
  { code: '502', label: 'Guatemala (+502)' },
  { code: '504', label: 'Honduras (+504)' },
  { code: '52', label: 'México (+52)' },
  { code: '505', label: 'Nicaragua (+505)' },
  { code: '507', label: 'Panamá (+507)' },
  { code: '595', label: 'Paraguay (+595)' },
  { code: '51', label: 'Perú (+51)' },
  { code: '1', label: 'República Dominicana (+1)' },
  { code: '598', label: 'Uruguay (+598)' },
  { code: '58', label: 'Venezuela (+58)' }
];


export default function ModalTelefono({ email, onClose, onSaved }: ModalTelefonoProps) {
  const [countryCode, setCountryCode] = useState<string>('57');
  const [phone, setPhone] = useState<string>('');

  const handleSave = async () => {
    const full = `${countryCode}${phone}`;
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios/${email}/telefono`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefono: full })
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.detail || 'Error al actualizar');

      Cookies.set('telefonoUsuario', full);
      onSaved(full);
    } catch (err) {
      console.error('Error:', err);
      Swal.fire('Error', 'No pude guardar tu teléfono', 'error');
    }
  };

  return (
    <div className="ModalTelefono-overlay">
      <div className="ModalTelefono-modal">
        <h2 className="ModalTelefono-title">Agrega tu número de WhatsApp</h2>
        <p className="ModalTelefono-subtitle">Usaremos este número para notificaciones importantes de tu reserva</p>

        <div className="ModalTelefono-form">
          <label htmlFor="codigoPais">País</label>
          <select
            id="codigoPais"
            className="ModalTelefono-select"
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
          >
            {PAISES.map(p => (
              <option key={p.code} value={p.code}>{p.label}</option>
            ))}
          </select>

          <label htmlFor="numero">Número de teléfono</label>
          <input
            id="numero"
            className="ModalTelefono-input"
            type="tel"
            placeholder="Ej: 3001234567"
            value={phone}
            onChange={e => {
                const value = e.target.value;
                // Solo guarda si son dígitos
                if (/^\d*$/.test(value)) {
                    setPhone(value);
                }
                }}
          />
        </div>

        <div className="ModalTelefono-buttons">
          <button className="ModalTelefono-btn ModalTelefono-btn-primary" onClick={handleSave} disabled={!phone}>
            Guardar
          </button>
          <button className="ModalTelefono-btn ModalTelefono-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
