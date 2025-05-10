// sin 'use client', sin async, sin hooks aquí
import TarjetasEcommerce from '@/Componentes/TarjetasEcommerce'

export default function GlampingsPage() {
  // al usar key="all" garantizamos un remount limpio de TarjetasEcommerce
  return <TarjetasEcommerce key="all" />
}

