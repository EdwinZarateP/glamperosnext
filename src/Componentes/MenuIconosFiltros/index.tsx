// src/components/MenuIconosFiltros.tsx
'use client'

import React, { useContext } from 'react'
import { GiHabitatDome, GiCampingTent, GiHut, GiTreehouse } from 'react-icons/gi'
import { FaCaravan } from 'react-icons/fa'
import { ContextoApp } from '../../context/AppContext'
import './estilos.css'

const tipos = [
  { label: 'Domo',       icon: <GiHabitatDome />, key: 'domo' },
  { label: 'Tienda',     icon: <GiCampingTent />, key: 'tienda' },
  { label: 'Tipi',       icon: <GiHut />,          key: 'tipi' },
  { label: 'Casa Árbol', icon: <GiTreehouse />,    key: 'casaArbol' },
  { label: 'Remolque',   icon: <FaCaravan />,      key: 'remolque' },
]

const MenuIconosFiltros: React.FC = () => {
  const { tipoGlamping, setTipoGlamping } = useContext(ContextoApp)!
  
  const onClick = (key: string) => {
    // si ya está seleccionado, lo dejamos como cadena vacía
    setTipoGlamping(tipoGlamping === key ? '' : key)
  }

  return (
    <div className="MenuIconosFiltros-container">
      {tipos.map(({ label, icon, key }) => {
        const activo = tipoGlamping === key
        return (
          <button
            key={key}
            className={`MenuIconosFiltros-item ${activo ? 'activo' : ''}`}
            onClick={() => onClick(key)}
            aria-pressed={activo}
          >
            <span className="MenuIconosFiltros-icon">{icon}</span>
            <span className="MenuIconosFiltros-label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MenuIconosFiltros
