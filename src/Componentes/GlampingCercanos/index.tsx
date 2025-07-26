// /Componentes/GlampingCercanos/GlampingCercanos.tsx
import React from "react";
import Link from "next/link";
import { MdOutlinePets } from "react-icons/md";
import { calcularTarifaBasica } from "@/Funciones/calcularTarifaBasica";
import "./estilos.css";

type Glamping = {
  _id: string;
  nombreGlamping: string;
  tipoGlamping: string;
  ciudad_departamento: string;
  precioEstandar: number;
  descuento: number;               // ← ahora incluimos el % de descuento
  imagenes: string[];
  Acepta_Mascotas: boolean;
};

type Props = {
  lat: number;
  lng: number;
  searchParams?: Record<string, string | undefined>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function fetchGlampings(lat: number, lng: number): Promise<Glamping[]> {
  const url = `${API_BASE}/glampings/glampingfiltrados?lat=${lat}&lng=${lng}&limit=10`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Error ${res.status}:`, await res.text());
      return [];
    }
    const data = await res.json();
    return (data.glampings as Glamping[]).slice(1); // salto el primero (mismo glamping)
  } catch (e) {
    console.error("Error llamando a la API:", e);
    return [];
  }
}

export default async function GlampingCercanos({ lat, lng, searchParams }: Props) {
  const glampings = await fetchGlampings(lat, lng);
  const fechaInicioUrl = searchParams?.fechaInicioUrl ?? "";
  const fechaFinUrl    = searchParams?.fechaFinUrl    ?? "";

  if (glampings.length === 0) {
    const Regiones = (await import("@/Componentes/Regiones")).default;
    return <Regiones />;
  }

  return (
    <div className="GlampingCercanos-contenedor">
      <h2>Otros lojamientos cercanos:</h2>
      <div className="GlampingCercanos-carrusel">
        
        {glampings.map((g) => {
          const ciudadCorta = g.ciudad_departamento.split("-")[0];
          // Aplicamos la fórmula:
          const descuento = g.descuento ? g.descuento / 100 : 0;
          const { precioSinDescuento, precioConDescuento } =
            calcularTarifaBasica(g.precioEstandar, descuento);

          return (
            <div key={g._id} className="GlampingCercanos-tarjeta">
              <Link
                href={`/propiedad/${g._id}?fechaInicioUrl=${fechaInicioUrl}&fechaFinUrl=${fechaFinUrl}`}
              >
                <div className="GlampingCercanos-imagen-contenedor">
                  <img
                    src={g.imagenes[0]}
                    alt={`${g.nombreGlamping} ${g.ciudad_departamento}`}
                    className="GlampingCercanos-imagen"
                  />
                  {g.Acepta_Mascotas && (
                    <MdOutlinePets className="GlampingCercanos-icono-mascotas" />
                  )}
                </div>
              </Link>

              <h3 className="GlampingCercanos-titulo">
                {g.tipoGlamping} {ciudadCorta}
              </h3>

              <div className="GlampingCercanos-precios">
                <div className="GlampingCercanos-precio-item">
                  <span className="GlampingCercanos-precio-etiqueta">
                    Precio fin de semana
                  </span>
                  <span className="GlampingCercanos-precio-valor">
                    ${precioSinDescuento.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="GlampingCercanos-precio-item">
                  <span className="GlampingCercanos-precio-etiqueta">
                    Precio de domingo a jueves
                  </span>
                  <span className="GlampingCercanos-precio-valor">
                    ${precioConDescuento.toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
