// sin 'use client', sin async, sin hooks aquí
import TarjetasEcommerce from '@/Componentes/TarjetasEcommerce'

interface Props {
  params: { filtros?: string[] }
}
export default function FiltradosPage({ params }: Props) {
  const filtros = params.filtros ?? []
  return <TarjetasEcommerce filtros={filtros} />
}
