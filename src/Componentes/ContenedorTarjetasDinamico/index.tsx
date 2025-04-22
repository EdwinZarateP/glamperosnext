"use client";

import { useEffect, useState, useCallback, useContext } from "react";
import { ContextoApp } from "@/context/AppContext";
import Tarjeta from "@/Componentes/Tarjeta/index";
import { precioConRecargo } from "@/Funciones/precioConRecargo";
import Cookies from "js-cookie";
import "./estilos.css";

/** INTERFACES **/
interface GlampingData {
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

/** PROPS DEL COMPONENTE **/
interface ContenedorTarjetasDinamicoProps {
  lat: number; // Coordenada de latitud
  lng: number; // Coordenada de longitud
  radio?: number; // Radio de búsqueda (km), opcional
}

const ContenedorTarjetasDinamico: React.FC<ContenedorTarjetasDinamicoProps> = ({
  lat,
  lng,
  radio = 150, // Por defecto, usaremos 200 km de radio
}) => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  /** DESTRUCTURING DEL CONTEXTO **/
  const {
    activarFiltros,
    filtros,
    setFiltros,
    // Eliminamos: activarFiltrosUbicacion, activarFiltrosUbicacionBogota, etc.
    activarFiltrosFechas,
    activarFiltrosHuespedes,
    huespedesConfirmado,
    fechaInicio,
    fechaFin,
    activarFiltrosDomo,
    activarFiltrosTienda,
    activarFiltrosCabaña,
    activarFiltrosCasaArbol,
    activarFiltrosRemolques,
    activarFiltrosChoza,
    activarFiltrosLumipod,
    activarFiltrosMascotas,
    activarFiltrosClimaCalido,
    activarFiltrosClimaFrio,
    activarFiltrosPlaya,
    activarFiltrosNaturaleza,
    activarFiltrosRio,
    activarFiltrosCascada,
    activarFiltrosMontana,
    activarFiltrosCaminata,
    activarFiltrosDesierto,
    activarFiltrosJacuzzi,
  } = almacenVariables;

  /** ESTADOS INTERNOS **/
  const [glampings, setGlampingsLocal] = useState<GlampingData[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(18);
  const [page, setPage] = useState(1);

  // Bandera para saber si la URL está limpia de parámetros
  const [isInitialLanding, setIsInitialLanding] = useState<boolean>(false);

  // ID de usuario tomado de cookies, para manejo de favoritos
  const idUsuarioCookie = Cookies.get("idUsuario");

  /** 
   * Determina si un glamping está en favoritos.
   */
  const esFavorito = (glampingId: string, favs: string[] = []): boolean => {
    return Array.isArray(favs) && favs.includes(glampingId);
  };

  /** 
   * Al montar el componente, hacemos scroll to top 
   * y verificamos si la URL está limpia de parámetros.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.toString()) {
      setIsInitialLanding(true);
    }
  }, []);

  /** 
   * Forzamos la ubicación a la que pasen los padres (lat, lng).
   * Esto básicamente solo lo utilizamos si tu estado global requiere
   * saber "en qué coordenadas estoy filtrando".
   */
  useEffect(() => {
    setFiltros((prev: any) => ({
      ...prev,
      cordenadasFilter: { LATITUD: lat, LONGITUD: lng },
    }));
  }, [setFiltros, lat, lng]);

  /**
   * Obtenemos la lista de favoritos desde la API (si hay usuario logueado)
   */
  useEffect(() => {
    const fetchFavoritos = async () => {
      if (idUsuarioCookie) {
        try {
          const response = await fetch(
            `https://glamperosapi.onrender.com/favoritos/${idUsuarioCookie}`
          );
          const data = await response.json();
          setFavoritos(data);
        } catch (error) {
          console.error("Error al obtener los favoritos:", error);
        }
      }
    };
    fetchFavoritos();
  }, [idUsuarioCookie]);

  /**
   * Función para obtener datos de glampings de la API (paginados)
   */
  const fetchDataFromAPI = useCallback(async (page = 1, limit = 18) => {
    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los datos de la API");
      }

      const data: GlampingData[] = await response.json();
      if (data.length === 0) {
        return; // No hay más datos
      }

      // Mapeamos para garantizar valores por defecto
      const parsedData = data.map((g) => ({
        _id: g._id,
        habilitado: g.habilitado || true,
        nombreGlamping: g.nombreGlamping || "Nombre no disponible",
        tipoGlamping: g.tipoGlamping || "Choza",
        ciudad_departamento: g.ciudad_departamento || "Ciudad no disponible",
        precioEstandar: g.precioEstandar || 0,
        descuento: g.descuento || 0,
        calificacion: g.calificacion || null,
        imagenes: g.imagenes || [],
        ubicacion: {
          lat: g.ubicacion?.lat || null,
          lng: g.ubicacion?.lng || null,
        },
        Acepta_Mascotas: g.Acepta_Mascotas || false,
        fechasReservadas: g.fechasReservadas || [],
        amenidadesGlobal: g.amenidadesGlobal || [],
        precioEstandarAdicional: g.precioEstandarAdicional || 0,
        Cantidad_Huespedes: g.Cantidad_Huespedes || 1,
        Cantidad_Huespedes_Adicional: g.Cantidad_Huespedes_Adicional || 0,
      }));

      // Evitamos duplicados
      setGlampingsLocal((prevData) => {
        const newData = parsedData.filter(
          (newGlamping) => !prevData.some((g) => g._id === newGlamping._id)
        );
        return [...prevData, ...newData];
      });

      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error al obtener glampings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Uso de sessionStorage para cachear la lista de glampings.
   * Si no se encuentra, se llama a la API.
   */
  useEffect(() => {
    const fetchGlampings = async () => {
      const storedData = sessionStorage.getItem("glampingsData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setGlampingsLocal(parsedData);
          setLoading(false);
        } catch (error) {
          console.error("Error al parsear los datos de sessionStorage:", error);
          sessionStorage.removeItem("glampingsData");
          await fetchDataFromAPI(page);
        }
      } else {
        await fetchDataFromAPI(page);
      }
    };

    fetchGlampings();
  }, [page, fetchDataFromAPI]);

  /**
   * Función para cargar más resultados (scroll infinito)
   */
  const handleLoadMore = useCallback(() => {
    if (!loading) {
      fetchDataFromAPI(page, 18);
      setVisibleCount((prevCount) => prevCount + 18);
    }
  }, [loading, page, fetchDataFromAPI]);

  /**
   * Manejar el scroll infinito
   */
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;
    if (scrollTop + windowHeight >= fullHeight - 200) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /**
   * Solo imprimimos en consola cuando los filtros cambian.
   */
  useEffect(() => {
    console.log("Filtros actualizados:", filtros);
  }, [
    filtros,
    activarFiltros,
    fechaInicio,
    fechaFin,
    isInitialLanding,
  ]);

  /**
   * Función para calcular la distancia (Haversine)
   */
  function calcularDistancia(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Verifica si no hay reservas en el rango seleccionado
   */
  const noTieneFechasReservadasEnRango = (fechasReservadas: string[]) => {
    if (!fechaInicio || !fechaFin) return true;
    let inicio = new Date(fechaInicio);
    let fin = new Date(fechaFin);
    inicio.setDate(inicio.getDate() - 1);
    fin.setDate(fin.getDate() - 1);
    return !fechasReservadas.some((fecha) => {
      const fechaReservada = new Date(fecha);
      return fechaReservada >= inicio && fechaReservada <= fin;
    });
  };

  /**
   * Aseguramos que el Glamping esté dentro del radio fijo (lat, lng) => radio (en km)
   */
  function estaDentroRadioLocal(glamping: GlampingData) {
    if (glamping.ubicacion.lat == null || glamping.ubicacion.lng == null) {
      return false;
    }
    const distancia = calcularDistancia(
      lat,
      lng,
      glamping.ubicacion.lat,
      glamping.ubicacion.lng
    );
    return distancia <= radio;
  }

  /**
   * Filtrado de glampings
   * - Primero limitamos a los que están dentro del radio (estaDentroRadioLocal)
   * - Luego aplicamos los demás filtros (precio, fechas, amenidades, etc.)
   */
  const glampingsFiltrados = glampings.filter((glamping) => {
    // 1) Forzamos que estén en el radio local:
    const cumpleRadio = estaDentroRadioLocal(glamping);

    // 2) Solo habilitados
    const filtraHabilitados = glamping.habilitado === true;

    // 3) Precio
    const cumplePrecio =
      !activarFiltros ||
      (filtros?.precioFilter?.[0] !== undefined &&
        filtros?.precioFilter?.[1] !== undefined &&
        precioConRecargo(glamping.precioEstandar) >= filtros.precioFilter[0] &&
        precioConRecargo(glamping.precioEstandar) <= filtros.precioFilter[1]);

    // 4) Fechas disponibles
    const cumpleFechasReservadas =
      !activarFiltrosFechas ||
      noTieneFechasReservadasEnRango(glamping.fechasReservadas);

    // 5) Capacidad de huéspedes
    const cumpleHuespedes =
      !activarFiltrosHuespedes ||
      (huespedesConfirmado &&
        glamping.Cantidad_Huespedes + glamping.Cantidad_Huespedes_Adicional >=
          huespedesConfirmado);

    // 6) Tipo de glamping
    const filtraDomo = !activarFiltrosDomo || glamping.tipoGlamping === "Domo";
    const filtraTienda =
      !activarFiltrosTienda || glamping.tipoGlamping === "Tienda";
    const filtraCabaña =
      !activarFiltrosCabaña || glamping.tipoGlamping === "Cabaña";
    const filtraCasaArbol =
      !activarFiltrosCasaArbol || glamping.tipoGlamping === "Casa del arbol";
    const filtraRemolque =
      !activarFiltrosRemolques || glamping.tipoGlamping === "Remolque";
    const filtraChoza =
      !activarFiltrosChoza || glamping.tipoGlamping === "Choza";
    const filtraLumipod =
      !activarFiltrosLumipod || glamping.tipoGlamping === "Lumipod";
      

    // 7) Mascotas y amenidades
    const filtraMascotas =
      !activarFiltrosMascotas || glamping.Acepta_Mascotas === true;
    const filtraClimaCalido =
      !activarFiltrosClimaCalido ||
      glamping.amenidadesGlobal.includes("Clima Calido");
    const filtraClimaFrio =
      !activarFiltrosClimaFrio ||
      glamping.amenidadesGlobal.includes("Clima Frio");
    const filtraPlaya =
      !activarFiltrosPlaya || glamping.amenidadesGlobal.includes("Playa");
    const filtraNaturaleza =
      !activarFiltrosNaturaleza ||
      glamping.amenidadesGlobal.includes("Naturaleza");
    const filtraRio =
      !activarFiltrosRio || glamping.amenidadesGlobal.includes("Rio");
    const filtraCascada =
      !activarFiltrosCascada ||
      glamping.amenidadesGlobal.includes("Cascada");
    const filtraMontana =
      !activarFiltrosMontana ||
      glamping.amenidadesGlobal.includes("En la montaña");
    const filtraCaminata =
      !activarFiltrosCaminata ||
      glamping.amenidadesGlobal.includes("Caminata");
    const filtraDesierto =
      !activarFiltrosDesierto ||
      glamping.amenidadesGlobal.includes("Desierto");
    const filtraJacuzzi =
      !activarFiltrosJacuzzi ||
      glamping.amenidadesGlobal.includes("Jacuzzi");

    return (
      cumpleRadio && // Siempre primero: Debe estar dentro del radio local
      filtraHabilitados &&
      cumplePrecio &&
      cumpleFechasReservadas &&
      cumpleHuespedes &&
      filtraDomo &&
      filtraTienda &&
      filtraCabaña &&
      filtraCasaArbol &&
      filtraRemolque &&
      filtraChoza &&
      filtraLumipod &&
      filtraMascotas &&
      filtraClimaCalido &&
      filtraClimaFrio &&
      filtraPlaya &&
      filtraNaturaleza &&
      filtraRio &&
      filtraCascada &&
      filtraMontana &&
      filtraCaminata &&
      filtraDesierto &&
      filtraJacuzzi
    );
  });

  /**
   * (Opcional) Si quieres ordenarlos por cercanía a lat,lng:
   */
  const glampingsOrdenados = glampingsFiltrados.sort((a, b) => {
    const distA = calcularDistancia(lat, lng, a.ubicacion.lat ?? 0, a.ubicacion.lng ?? 0);
    const distB = calcularDistancia(lat, lng, b.ubicacion.lat ?? 0, b.ubicacion.lng ?? 0);
    return distA - distB;
  });

  /**
   * Mostramos sólo los que entren en visibleCount
   */
  const glampingsMostrados = glampingsOrdenados.slice(0, visibleCount);

  /**
   * Renderizados Condicionales (loading, no-result, o lista final)
   */
  if (loading) {
    return (
      <div className="contenedor-tarjetas">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="tarjeta-skeleton">
            <div className="tarjeta-skeleton-imagen" />
            <div className="tarjeta-skeleton-info" />
          </div>
        ))}
      </div>
    );
  }

  if (glampingsMostrados.length === 0) {
    return (
      <div className="no-glampings-container">
        <div className="no-glampings-message">
          <img
            src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/meme.jpg"
            alt="Meme divertido"
            className="meme-imagen"
          />
          <h2>Lo sentimos, no hemos encontrado glamping con tus filtros</h2>
          <p>Pero no te preocupes, ¡estamos trabajando para agregar más opciones!</p>
        </div>
      </div>
    );
  }

  /**
   * Render final: la lista de tarjetas
   */
  return (
    <div className="contenedor-tarjetas">
      {glampingsMostrados.map((glamping, index) => (
        <Tarjeta
          key={index}
          glampingId={glamping._id}
          imagenes={glamping.imagenes}
          ciudad={glamping.ciudad_departamento}
          precio={glamping.precioEstandar}
          descuento={glamping.descuento}
          calificacion={glamping.calificacion || 5}
          favorito={esFavorito(glamping._id, favoritos)}
          nombreGlamping={glamping.nombreGlamping}
          tipoGlamping={glamping.tipoGlamping}
          ubicacion={{
            lat: glamping.ubicacion.lat ?? 0,
            lng: glamping.ubicacion.lng ?? 0,
          }}
          onFavoritoChange={(nuevoEstado) =>
            console.log(`Favorito en tarjeta ${index + 1}:`, nuevoEstado)
          }
          Acepta_Mascotas={glamping.Acepta_Mascotas}
          fechasReservadas={glamping.fechasReservadas}
          Cantidad_Huespedes={glamping.Cantidad_Huespedes}
          precioEstandarAdicional={glamping.precioEstandarAdicional}
          Cantidad_Huespedes_Adicional={glamping.Cantidad_Huespedes_Adicional}
          amenidadesGlobal={glamping.amenidadesGlobal}
        />
      ))}
    </div>
  );
};

export default ContenedorTarjetasDinamico;
