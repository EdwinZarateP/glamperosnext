// /Componentes/ContenedorTarjetasServer.tsx

import Tarjeta from "@/Componentes/Tarjeta/index";


// Define la interfaz para los datos de un glamping
export interface GlampingData {
  _id: string;
  habilitado: boolean;
  nombreGlamping: string;
  tipoGlamping: string;
  ciudad_departamento: string;
  precioEstandar: number;
  descuento: number;
  calificacion: number | null;
  imagenes: string[];
  ubicacion: {
    lat: number | null;
    lng: number | null;
  };
  Acepta_Mascotas: boolean;
  fechasReservadas: string[];
  amenidadesGlobal: string[];
  precioEstandarAdicional: number;
  Cantidad_Huespedes: number;
  Cantidad_Huespedes_Adicional: number;
  favorito?: boolean;
}

// Exporta la función getGlampings para poder utilizarla desde otros componentes
export async function getGlampings(page = 1, limit = 18): Promise<GlampingData[]> {
  const res = await fetch(
    `https://glamperosapi.onrender.com/glampings?page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Error al obtener los glampings");
  }
  const data: GlampingData[] = await res.json();
  return data.map((glamping) => ({
    _id: glamping._id,
    habilitado: glamping.habilitado || true,
    nombreGlamping: glamping.nombreGlamping || "Nombre no disponible",
    tipoGlamping: glamping.tipoGlamping || "Choza",
    ciudad_departamento: glamping.ciudad_departamento || "Ciudad no disponible",
    precioEstandar: glamping.precioEstandar || 0,
    descuento: glamping.descuento || 0,
    calificacion: glamping.calificacion || null,
    imagenes: glamping.imagenes || [],
    ubicacion: {
      lat: glamping.ubicacion?.lat || null,
      lng: glamping.ubicacion?.lng || null,
    },
    Acepta_Mascotas: glamping.Acepta_Mascotas || false,
    fechasReservadas: glamping.fechasReservadas || [],
    amenidadesGlobal: glamping.amenidadesGlobal || [],
    precioEstandarAdicional: glamping.precioEstandarAdicional || 0,
    Cantidad_Huespedes: glamping.Cantidad_Huespedes || 1,
    Cantidad_Huespedes_Adicional: glamping.Cantidad_Huespedes_Adicional || 0,
  }));
}

// Componente de servidor que renderiza la lista de glampings
export default async function ContenedorTarjetasServer() {
  let glampings: GlampingData[] = [];
  try {
    glampings = await getGlampings();
  } catch (error) {
    console.error("Error al obtener glampings:", error);
  }

  if (!glampings || glampings.length === 0) {
    return (
      <div className="no-glampings-container">
        <div className="no-glampings-message">
          <img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/meme.jpg " alt="Meme divertido" className="meme-imagen" />
          <h2>Lo sentimos, no hemos encontrado glampings</h2>
          <p>
            Pero no te preocupes, ¡estamos trabajando para agregar más opciones!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-tarjetas">
      {glampings.map((glamping) => (
        <Tarjeta
          key={glamping._id}
          glampingId={glamping._id}
          imagenes={glamping.imagenes}
          ciudad={glamping.ciudad_departamento}
          precio={glamping.precioEstandar}
          descuento={glamping.descuento}
          calificacion={glamping.calificacion || 5}
          favorito={false} // Aquí no se maneja la lógica de favoritos en SSR
          nombreGlamping={glamping.nombreGlamping}
          tipoGlamping={glamping.tipoGlamping}
          ubicacion={{
            lat: glamping.ubicacion.lat ?? 0,
            lng: glamping.ubicacion.lng ?? 0,
          }}
          onFavoritoChange={() => {}}
          Acepta_Mascotas={glamping.Acepta_Mascotas}
          fechasReservadas={glamping.fechasReservadas}
          Cantidad_Huespedes={glamping.Cantidad_Huespedes}
          precioEstandarAdicional={glamping.precioEstandarAdicional}
          Cantidad_Huespedes_Adicional={glamping.Cantidad_Huespedes_Adicional}
        />
      ))}
    </div>
  );
}
