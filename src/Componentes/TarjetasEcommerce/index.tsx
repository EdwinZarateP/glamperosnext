'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Tarjeta from '../Tarjeta'
import './estilos.css'

interface TarjetasEcommerceProps {
  filtros?: string[]
}

const API_BASE = 'http://127.0.0.1:8000/glampings/glampingfiltrados'
// const API_BASE = 'https://glamperosapi.onrender.com/glampings/glampingfiltrados'
const PAGE_SIZE = 30


// Define aquí tus ciudades, tipos y amenidades válidos
const CIUDADES = ['bogota', 'medellin', 'guatavita']
const TIPOS = ['domo', 'tipi', 'tienda', 'cabana', 'lulipod']
const AMENIDADES = ['Jacuzzi', 'Piscina']


export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const router = useRouter()
  const [glampings, setGlampings] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [queryEnviada, setQueryEnviada] = useState('')
  const observerRef = useRef<HTMLDivElement>(null)
  const observerInstance = useRef<IntersectionObserver | null>(null)

  // Limpia y categoriza filtros: ciudad, tipo, amenidades
  const applied = filtros ?? []
  const ciudadFilter = applied.find(f => CIUDADES.includes(f.toLowerCase())) || null
  const tipoFilter = applied.find(f => TIPOS.includes(f)) || null
  const amenidadesFilter = applied.filter(
    f => f !== ciudadFilter && f !== tipoFilter
  )
  // Orden canónico para URL y key
  const canonical = [
    ciudadFilter,
    tipoFilter,
    ...amenidadesFilter.sort()
  ].filter(Boolean) as string[]
  const filtersKey = canonical.join(',')

  // Helper para coordenadas según ciudad
  const getCoords = (c: string) => {
    const map: Record<string, { lat: number; lng: number }> = {
      bogota:    { lat: 4.710989, lng: -74.07209 },
      medellin:  { lat: 6.244203, lng: -75.5812119 },
      guatavita: { lat: 4.925296, lng: -73.838533 },
    }
    return map[c.toLowerCase()] || map['bogota']
  }

  // Normaliza respuesta de la API
  const normalize = (json: any): any[] => {
    if (Array.isArray(json)) return json
    if (json && Array.isArray(json.glampings)) return json.glampings
    return []
  }

  const mapProps = (g: any) => {
    const ubic = typeof g.ubicacion === 'string' ? JSON.parse(g.ubicacion) : g.ubicacion
    return {
      glampingId: g._id,
      imagenes: g.imagenes,
      ciudad: g.ciudad_departamento,
      precio: g.precioEstandar,
      calificacion: g.calificacion,
      favorito: false,
      onFavoritoChange: () => {},
      descuento: g.descuento,
      tipoGlamping: g.tipoGlamping,
      nombreGlamping: g.nombreGlamping,
      ubicacion: { lat: ubic.lat, lng: ubic.lng },
      Acepta_Mascotas: g.Acepta_Mascotas,
      fechasReservadas: g.fechasReservadas,
      amenidadesGlobal: g.amenidadesGlobal,
      Cantidad_Huespedes: g.Cantidad_Huespedes,
      precioEstandarAdicional: g.precioEstandarAdicional,
      Cantidad_Huespedes_Adicional: g.Cantidad_Huespedes_Adicional,
    }
  }

  // Al cambiar filtros, reset
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setGlampings([])
  }, [filtersKey])

  // Fetch glampings
  useEffect(() => {
    const load = async () => {
      if (!hasMore) return
      setLoading(true)
      const qp = new URLSearchParams()
      qp.set('page', page.toString())
      qp.set('limit', PAGE_SIZE.toString())
      if (tipoFilter) qp.set('tipoGlamping', tipoFilter)
      amenidadesFilter.forEach(a => qp.append('amenidades', a))
      if (ciudadFilter) {
        const { lat, lng } = getCoords(ciudadFilter)
        qp.set('lat', lat.toString())
        qp.set('lng', lng.toString())
        qp.set('distanciaMax', '150') // Puedes ajustarlo según la UX
      }
      try {
        const res = await fetch(`${API_BASE}?${qp}`)
        const queryURL = `${API_BASE}?${qp}`
        setQueryEnviada(queryURL)

        if (res.status === 404) {
          setHasMore(false)
          return
        }
        const json = await res.json()
        const data = normalize(json)
        setGlampings(prev => page === 1 ? data : [...prev, ...data])
        if (data.length < PAGE_SIZE) setHasMore(false)
      } catch {
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, filtersKey, ciudadFilter, tipoFilter, JSON.stringify(amenidadesFilter)])

  // Infinite scroll init
  useEffect(() => {
    const onIntersect: IntersectionObserverCallback = entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        observerInstance.current?.unobserve(observerRef.current!)
        setPage(p => p + 1)
      }
    }
    observerInstance.current = new IntersectionObserver(onIntersect, {
      rootMargin: '200px', threshold: 0.1
    })
    if (observerRef.current) observerInstance.current.observe(observerRef.current)
    return () => observerInstance.current?.disconnect()
  }, [])

  // Re-observe after load
  useEffect(() => {
    if (!loading && hasMore && observerRef.current) {
      observerInstance.current?.observe(observerRef.current)
    }
  }, [loading, hasMore])

  // Toggle de filtros en URL (orden canónico)
  const toggleFilter = (f: string) => {
  const list = [...canonical]
  const idx = list.indexOf(f)

  const esTipo = TIPOS.includes(f)

  // Si se trata de un tipo y ya hay uno seleccionado, reemplázalo
  if (esTipo) {
    const tipoExistente = list.find(x => TIPOS.includes(x))
    if (tipoExistente && tipoExistente !== f) {
      list.splice(list.indexOf(tipoExistente), 1)
    }
  }

  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    list.push(f)
  }

  const city = list.find(x => CIUDADES.includes(x.toLowerCase()))
  const type = list.find(x => TIPOS.includes(x.toLowerCase()))
  const ams = list.filter(x => x !== city && x !== type)
  const newPath = [...(city ? [city] : []), ...(type ? [type] : []), ...ams]
  const path = newPath.length ? `/glampings/${newPath.join('/')}` : '/glampings'
  router.push(path)
}

  return (
    <div className="TarjetasEcommerce-container">
      <div className="TarjetasEcommerce-results">{glampings.length} resultados</div>
        <pre style={{ background: "#f8f8f8", padding: "8px", fontSize: "12px", border: "1px solid #ccc" }}>
          {queryEnviada}
        </pre>

      {canonical.length > 0 && (
        <div className="TarjetasEcommerce-breadcrumbs">
          {canonical.map((f, i) => (
            <span key={i} className="TarjetasEcommerce-breadcrumb-item">
              {f}
              <button className="TarjetasEcommerce-breadcrumb-remove" onClick={() => toggleFilter(f)}>×</button>
            </span>
          ))}
        </div>
      )}
      <nav className="TarjetasEcommerce-filtros">
        {[...CIUDADES, ...TIPOS, ...AMENIDADES].map(label => {
          const isActive = canonical.includes(label)
          const kind = CIUDADES.includes(label.toLowerCase()) || TIPOS.includes(label.toLowerCase())
            ? 'primary'
            : 'secondary'

          // Etiqueta legible
          const text = CIUDADES.includes(label.toLowerCase())
            ? `Cerca a ${label.charAt(0).toUpperCase() + label.slice(1)}`
            : label
          return (
            <button
              key={label}
              className={`TarjetasEcommerce-filtro ${kind} ${isActive ? 'TarjetasEcommerce-filtro-activo' : ''}`}
              onClick={() => toggleFilter(label)}
            >
              {text}
            </button>
          )
        })}
      </nav>
      <div className="TarjetasEcommerce-lista">
        {glampings.map(g => <Tarjeta key={g._id} {...mapProps(g)} />)}
      </div>
      {loading && <p className="TarjetasEcommerce-loading">Cargando...</p>}
      {glampings.length > 0 && <div ref={observerRef} />}
    </div>
  )
}