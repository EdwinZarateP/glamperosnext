// src/Componentes/TarjetasEcommerce/TarjetasEcommerceServer.tsx

import React from 'react'
import TarjetasEcommerce from './index'
import municipiosData from '../MunicipiosGeneral/municipiosGeneral.json'

interface Props {
  filtros?: string[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
const API_URL  = `${API_BASE}/glampings/glampingfiltrados2`
const PAGE_SIZE = 24

// slug de ciudad por defecto
const DEFAULT_CITY_SLUG = 'bogota'

type Municipio = {
  CIUDAD_DEPARTAMENTO: string
  CIUDAD: string
  DEPARTAMENTO: string
  LATITUD: number
  LONGITUD: number
}
type MunicipioConSlug = Municipio & { SLUG: string }

const municipiosConSlug: MunicipioConSlug[] = municipiosData.map(m => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-'),
}))

const TIPOS = ['domo', 'tipi', 'tienda', 'cabana', 'lumipod']

function getCiudadFromSlug(slug: string): MunicipioConSlug | null {
  return municipiosConSlug.find(m => m.SLUG === slug.toLowerCase()) || null
}

/**
 * Construye query string con lat/lng, tipo y amenidades
 */
function construirQuery(
  pageArg: number,
  filtrosSinPagina: string[]
): string {
  const params = new URLSearchParams()
  params.set('page', String(pageArg))
  params.set('limit', String(PAGE_SIZE))

  // primera posición siempre slug válido aquí
  const ciudad = getCiudadFromSlug(filtrosSinPagina[0])!
  params.set('lat', String(ciudad.LATITUD))
  params.set('lng', String(ciudad.LONGITUD))

  // tipo
  const tipo = filtrosSinPagina.find(f => TIPOS.includes(f.toLowerCase()))
  if (tipo) params.set('tipoGlamping', tipo.toLowerCase())

  // amenidades
  const extras = filtrosSinPagina.slice(1)
  const sinTipo = tipo
    ? extras.filter(f => f.toLowerCase() !== tipo.toLowerCase())
    : extras
  sinTipo.forEach(a => params.append('amenidades', a.toLowerCase()))

  return params.toString()
}

export default async function TarjetasEcommerceServer({ filtros = [] }: Props) {
  // 1) página
  const last = filtros[filtros.length - 1] || ''
  const match = last.match(/^pagina-(\d+)$/)
  const pageArg = match ? parseInt(match[1], 10) : 1

  // 2) limpia el segmento página
  const filtrosSinPagina = match ? filtros.slice(0, -1) : filtros

  // --- fallback para SSR: si no hay filtros o slug inválido, usamos DEFAULT_CITY_SLUG ---
  let slugCiudad = filtrosSinPagina[0] ?? DEFAULT_CITY_SLUG
  let ciudad = getCiudadFromSlug(slugCiudad)
  if (!ciudad) {
    slugCiudad = DEFAULT_CITY_SLUG
    ciudad = getCiudadFromSlug(DEFAULT_CITY_SLUG)!
  }

  // nos aseguramos de incluir slugCiudad al principio
  const filtrosParaSSR = [slugCiudad, ...filtrosSinPagina.slice(1)]

  // 3) construye y ejecuta la petición SSR
  const qs = construirQuery(pageArg, filtrosParaSSR)
  let glampings: any[] = []
  let total = 0
  try {
    const res = await fetch(`${API_URL}?${qs}`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      glampings = json.glampings || []
      total     = typeof json.total === 'number' ? json.total : 0
    } else {
      console.warn(`API responded ${res.status}`)
    }
  } catch (err) {
    console.error('Fetch error glampings:', err)
  }

  return (
    <TarjetasEcommerce
      filtros={filtros}
      initialData={glampings}
      initialTotal={total}
    />
  )
}
