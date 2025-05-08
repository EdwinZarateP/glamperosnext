"use client";

import { useEffect, useState, useCallback, useContext } from "react";
// import { useRouter } from "next/navigation";
import { ContextoApp } from "../../context/AppContext";
import Tarjeta from "../../Componentes/Tarjeta/index";
import { precioConRecargo } from "../../Funciones/precioConRecargo";
import FiltrosContenedor from "../../Componentes/FiltrosContenedor/index";
import Cookies from "js-cookie";

import "./estilos.css";

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
  precioEstandarAdicional: number;
  Cantidad_Huespedes: number;
  Cantidad_Huespedes_Adicional: number;
  favorito?: boolean;
  amenidadesGlobal: string[];
}

const ContenedorTarjetas: React.FC = () => {
  // const router = useRouter();
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  const {
    activarFiltros,
    filtros,
    setFiltros, // Se asume que el contexto expone setFiltros para actualizar los filtros
    activarFiltrosUbicacion,
    activarFiltrosUbicacionBogota,
    activarFiltrosUbicacionMedellin,
    activarFiltrosUbicacionCali,
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
    activarFiltrosTipi,
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
    mostrarFiltros
  } = almacenVariables;

  const [glampings, setGlampingsLocal] = useState<GlampingData[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(18);
  const [page, setPage] = useState(1);
  const idUsuarioCookie = Cookies.get("idUsuario");

  // Bandera para saber si es el landing inicial (URL limpia)
  const [isInitialLanding, setIsInitialLanding] = useState<boolean>(false);

  // Función para saber si un glamping está entre los favoritos
  const esFavorito = (glampingId: string, favs: string[] = []): boolean => {
    return Array.isArray(favs) && favs.includes(glampingId);
  };

  // Al montar el componente, hacer scroll al tope y determinar si la URL está limpia
  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.toString()) {
      setIsInitialLanding(true);
    }
  }, []);

  // Obtener favoritos desde la API (si hay usuario logueado)
  useEffect(() => {
    const fetchFavoritos = async () => {
      if (idUsuarioCookie) {
        try {
          const response = await fetch(
            `https://glamperosapi.onrender.com/favoritos/${idUsuarioCookie}`
          );
          const data = await response.json();
          // ➡️ transformamos en array de strings limpios
          const favIds: string[] = Array.isArray(data)
            ? data.map((id: any) => id.toString().trim())
            : [];
          setFavoritos(favIds);

        } catch (error) {
          console.error("Error al obtener los favoritos:", error);
        }
      }
    };
    fetchFavoritos();
  }, [idUsuarioCookie]);

  // Si la URL ya tiene "ubicacion", actualizamos el filtro con ese valor
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ubicacionParam = searchParams.get("ubicacion");
    if (ubicacionParam) {
      console.log("La URL ya contiene una ubicación:", ubicacionParam);
      const [latStr, lngStr] = ubicacionParam.split(",");
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      setFiltros((prev: any) => ({
        ...prev,
        cordenadasFilter: { LATITUD: lat, LONGITUD: lng },
      }));
    }
  }, [setFiltros]);

  // Solicitar la ubicación del usuario solo si la URL no contiene ya "ubicacion"
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("ubicacion")) {
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Ubicación obtenida:", latitude, longitude);
          // Actualizamos el filtro con las coordenadas del usuario
          setFiltros((prev: any) => ({
            ...prev,
            cordenadasFilter: { LATITUD: latitude, LONGITUD: longitude },
          }));
          // Aquí ya se organiza la lista según la ubicación, pero no actualizamos la URL.
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
        }
      );
    } else {
      console.error("La geolocalización no es soportada por este navegador");
    }
  }, [setFiltros, filtros?.precioFilter, fechaInicio, fechaFin, isInitialLanding]);

  // Función para obtener datos de glampings de la API
  const fetchDataFromAPI = useCallback(async (page = 1, limit = 18) => {
    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings?page=${page}&limit=${limit}`
      );
      if (!response.ok)
        throw new Error("Error al obtener los datos de la API");

      const data: GlampingData[] = await response.json();

      if (data.length === 0) {
        return;
      }

      const parsedData = data.map((glamping) => ({
        _id: glamping._id,
        habilitado: glamping.habilitado || false,//Esto es lo que hace que se vean solo los true
        nombreGlamping: glamping.nombreGlamping || "Nombre no disponible",
        tipoGlamping: glamping.tipoGlamping || "Tipi",
        ciudad_departamento:
          glamping.ciudad_departamento || "Ciudad no disponible",
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
        Cantidad_Huespedes_Adicional:
          glamping.Cantidad_Huespedes_Adicional || 0,
      }));

      setGlampingsLocal((prevData) => {
        const newData = parsedData.filter(
          (newGlamping) =>
            !prevData.some((glamping) => glamping._id === newGlamping._id)
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

  // Obtener los glampings desde sessionStorage o la API
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

  // Función para cargar más resultados
  const handleLoadMore = useCallback(() => {
    if (!loading) {
      fetchDataFromAPI(page, 18);
      setVisibleCount((prevCount) => prevCount + 18);
    }
  }, [loading, page, fetchDataFromAPI]);

  // Manejar scroll para carga infinita
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

  // En este efecto, originalmente se actualizaba la URL con query params; lo removemos para volver al estado original.
  useEffect(() => {
    console.log("Filtros actualizados:", filtros);
    // No se actualiza la URL; dejamos que la lógica interna organice los datos según la ubicación.
  }, [filtros, activarFiltros, activarFiltrosUbicacion, fechaInicio, fechaFin, isInitialLanding]);

  // Función para calcular distancia (Fórmula de Haversine)
  function calcularDistancia(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // km
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

  // Función para verificar fechas reservadas
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

  // Filtrado de glampings
  const glampingsFiltrados = glampings.filter((glamping) => {
    const filtraHabilitados = glamping.habilitado === true;
    const cumplePrecio =
      !activarFiltros ||
      (filtros?.precioFilter?.[0] !== undefined &&
        filtros?.precioFilter?.[1] !== undefined &&
        precioConRecargo(glamping.precioEstandar) >= filtros.precioFilter[0] &&
        precioConRecargo(glamping.precioEstandar) <= filtros.precioFilter[1]);
    const cumpleCoordenadas =
      !activarFiltrosUbicacion ||
      (filtros?.cordenadasFilter?.LATITUD !== undefined &&
        filtros?.cordenadasFilter?.LONGITUD !== undefined &&
        calcularDistancia(
          filtros.cordenadasFilter?.LATITUD,
          filtros.cordenadasFilter?.LONGITUD,
          glamping.ubicacion.lat ?? 0,
          glamping.ubicacion.lng ?? 0
        ) <= 1500);
    const cumpleCoordenadasBogota =
      !activarFiltrosUbicacionBogota ||
      calcularDistancia(
        4.316107698,
        -74.181072702,
        glamping.ubicacion.lat ?? 0,
        glamping.ubicacion.lng ?? 0
      ) <= 1500;
    const cumpleCoordenadasMedellin =
      !activarFiltrosUbicacionMedellin ||
      calcularDistancia(
        6.257590259,
        -75.611031065,
        glamping.ubicacion.lat ?? 0,
        glamping.ubicacion.lng ?? 0
      ) <= 1500;
    const cumpleCoordenadasCali =
      !activarFiltrosUbicacionCali ||
      calcularDistancia(
        3.399043723,
        -76.576492589,
        glamping.ubicacion.lat ?? 0,
        glamping.ubicacion.lng ?? 0
      ) <= 1500;
    const cumpleFechasReservadas =
      !activarFiltrosFechas ||
      noTieneFechasReservadasEnRango(glamping.fechasReservadas);
    const cumpleHuespedes =
      !activarFiltrosHuespedes ||
      (huespedesConfirmado &&
        glamping.Cantidad_Huespedes + glamping.Cantidad_Huespedes_Adicional >=
          huespedesConfirmado);
    const filtraDomo = !activarFiltrosDomo || glamping.tipoGlamping === "Domo";
    const filtraTienda =
      !activarFiltrosTienda || glamping.tipoGlamping === "Tienda";
    const filtraCabaña =
      !activarFiltrosCabaña || glamping.tipoGlamping === "Cabaña";
    const filtraCasaArbol =
      !activarFiltrosCasaArbol || glamping.tipoGlamping === "Casa del arbol";
    const filtraRemolque =
      !activarFiltrosRemolques || glamping.tipoGlamping === "Remolque";
    const filtraTipi =
      !activarFiltrosTipi || glamping.tipoGlamping === "Tipi";
    const filtraLumipod =
      !activarFiltrosLumipod || glamping.tipoGlamping === "Lumipod";
      
    const filtraMascotas =
      !activarFiltrosMascotas || glamping.Acepta_Mascotas === true;
    const filtraClimaCalido =
      !activarFiltrosClimaCalido ||
      glamping.amenidadesGlobal.includes("Clima Calido");
    const filtraClimaFrio =
      !activarFiltrosClimaFrio ||
      glamping.amenidadesGlobal.includes("Clima Frio");
    const filtraPlaya =
      !activarFiltrosPlaya ||
      glamping.amenidadesGlobal.includes("Playa");
    const filtraNaturaleza =
      !activarFiltrosNaturaleza ||
      glamping.amenidadesGlobal.includes("Naturaleza");
    const filtraRio =
      !activarFiltrosRio ||
      glamping.amenidadesGlobal.includes("Rio");
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
      filtraHabilitados &&
      cumplePrecio &&
      cumpleCoordenadas &&
      cumpleCoordenadasBogota &&
      cumpleCoordenadasMedellin &&
      cumpleCoordenadasCali &&
      cumpleFechasReservadas &&
      cumpleHuespedes &&
      filtraDomo &&
      filtraTienda &&
      filtraCabaña &&
      filtraCasaArbol &&
      filtraRemolque &&
      filtraTipi &&
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

  // Ordenamiento:
  // - Si se activa el filtro general de ubicación y existen las coordenadas del usuario, se ordena por la distancia a esas coordenadas.
  // - De lo contrario, se usa el ordenamiento de los filtros específicos (Cali, Bogotá o Medellín) si están activos.
  const glampingsOrdenados =
    filtros?.cordenadasFilter && activarFiltrosUbicacion
      ? glampingsFiltrados.sort((a, b) => {
          const userLat = filtros.cordenadasFilter?.LATITUD ?? 0;
          const userLng = filtros.cordenadasFilter?.LONGITUD ?? 0;
          const distanciaA = calcularDistancia(
            userLat,
            userLng,
            a.ubicacion.lat ?? 0,
            a.ubicacion.lng ?? 0
          );
          const distanciaB = calcularDistancia(
            userLat,
            userLng,
            b.ubicacion.lat ?? 0,
            b.ubicacion.lng ?? 0
          );
          return distanciaA - distanciaB;
        })
      : activarFiltrosUbicacionCali
      ? glampingsFiltrados.sort((a, b) => {
          const distanciaA = calcularDistancia(
            3.399043723,
            -76.576492589,
            a.ubicacion.lat ?? 0,
            a.ubicacion.lng ?? 0
          );
          const distanciaB = calcularDistancia(
            3.399043723,
            -76.576492589,
            b.ubicacion.lat ?? 0,
            b.ubicacion.lng ?? 0
          );
          return distanciaA - distanciaB;
        })
      : activarFiltrosUbicacionBogota
      ? glampingsFiltrados.sort((a, b) => {
          const distanciaA = calcularDistancia(
            4.316107698,
            -74.181072702,
            a.ubicacion.lat ?? 0,
            a.ubicacion.lng ?? 0
          );
          const distanciaB = calcularDistancia(
            4.316107698,
            -74.181072702,
            b.ubicacion.lat ?? 0,
            b.ubicacion.lng ?? 0
          );
          return distanciaA - distanciaB;
        })
      : activarFiltrosUbicacionMedellin
      ? glampingsFiltrados.sort((a, b) => {
          const distanciaA = calcularDistancia(
            6.257590259,
            -75.611031065,
            a.ubicacion.lat ?? 0,
            a.ubicacion.lng ?? 0
          );
          const distanciaB = calcularDistancia(
            6.257590259,
            -75.611031065,
            b.ubicacion.lat ?? 0,
            b.ubicacion.lng ?? 0
          );
          return distanciaA - distanciaB;
        })
      : glampingsFiltrados;

  const glampingsMostrados = glampingsOrdenados.slice(0, visibleCount);

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
          <img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/meme.jpg" alt="Meme divertido" className="meme-imagen" />
          <h2>Lo sentimos, no hemos encontrado glamping con tus filtros</h2>
          <p>
            Pero no te preocupes, ¡estamos trabajando para agregar más opciones!
          </p>
        </div>
      </div>
    );
  }

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
          onFavoritoChange={(nuevoEstado) => {
            // ➡️ si nuevoEstado es true agrego; si es false, quito
            if (nuevoEstado) {
              setFavoritos(prev => [...prev, glamping._id]);
            } else {
              setFavoritos(prev => prev.filter(id => id !== glamping._id));
            }
          }}
          Acepta_Mascotas={glamping.Acepta_Mascotas}
          fechasReservadas={glamping.fechasReservadas}
          Cantidad_Huespedes={glamping.Cantidad_Huespedes}
          precioEstandarAdicional={glamping.precioEstandarAdicional}
          Cantidad_Huespedes_Adicional={glamping.Cantidad_Huespedes_Adicional}
          amenidadesGlobal={glamping.amenidadesGlobal}
        />
      ))}
        {mostrarFiltros && <FiltrosContenedor />}
    </div>
  );
};

export default ContenedorTarjetas;
