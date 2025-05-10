"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import { GiCampingTent } from "react-icons/gi";
import "./estilos.css";
import { ContextoApp } from "../../context/AppContext";
import { ObtenerGlampingPorId } from "../../Funciones/ObtenerGlamping";
import { FaCopy } from "react-icons/fa";

// =============================================================================
//                       TIPOS E INTERFACES
// =============================================================================

// Ajusta esta interfaz para cubrir TODOS los campos que el servidor requiere
interface Glamping {
  // Campos básicos
  nombreGlamping?: string;
  tipoGlamping?: string;
  Cantidad_Huespedes?: number;
  Cantidad_Huespedes_Adicional?: number;
  Acepta_Mascotas?: boolean;
  precioEstandar?: number;
  precioEstandarAdicional?: number;
  minimoNoches?: number;
  diasCancelacion?: number;
  descuento?: number;
  descripcionGlamping?: string;
  video_youtube?: string;
  urlIcal?: string;
  urlIcalBooking?: string;
  amenidadesGlobal?: string[];

  // Campos de fechas
  fechasReservadas?: string[];
  fechasManual?: string[];
  fechasAirbnb?: string[];
  fechasBooking?: string[];
}

export interface PropiedadesCalendarioGeneral2 {
  fechasManual?: string[];
  fechasAirbnb?: string[];
  fechasBooking?: string[];
  fechasUnidas?: string[];
}

// =============================================================================
//                        COMPONENTE PRINCIPAL
// =============================================================================

const CalendarioGeneral2: React.FC<PropiedadesCalendarioGeneral2> = ({
  fechasManual: fechasManualProp = [],
  fechasAirbnb: fechasAirbnbProp = [],
  fechasBooking: fechasBookingProp = [],
}) => {
  // 1. Acceso al Contexto
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error(
      "El ContextoApp no está disponible. Asegúrate de envolver el componente en su proveedor."
    );
  }
  const { setFechasSeparadas } = almacenVariables;

  // 2. Estado para la información del glamping (incluye todos los campos)
  const [informacionGlamping, setInformacionGlamping] = useState<Glamping | null>(
    null
  );
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";

  // 3. Consulta los datos del glamping
  useEffect(() => {
    const consultarGlamping = async () => {
      if (!glampingId) return;

      const datos = await ObtenerGlampingPorId(glampingId);
      if (datos) {
        setInformacionGlamping({
          nombreGlamping: datos.nombreGlamping,
          tipoGlamping: datos.tipoGlamping,
          Cantidad_Huespedes: datos.Cantidad_Huespedes,
          Cantidad_Huespedes_Adicional: datos.Cantidad_Huespedes_Adicional,
          Acepta_Mascotas: datos.Acepta_Mascotas,
          precioEstandar: datos.precioEstandar,
          precioEstandarAdicional: datos.precioEstandarAdicional,
          minimoNoches: datos.minimoNoches,
          diasCancelacion: datos.diasCancelacion,
          descuento: datos.descuento,
          descripcionGlamping: datos.descripcionGlamping,
          video_youtube: datos.video_youtube,
          urlIcal: datos.urlIcal,
          urlIcalBooking: datos.urlIcalBooking,
          amenidadesGlobal: datos.amenidadesGlobal,
          fechasReservadas: datos.fechasReservadas || [],
          fechasManual: datos.fechasReservadasManual || [],
          fechasAirbnb: datos.fechasReservadasAirbnb || [],
          fechasBooking: datos.fechasReservadasBooking || []
        });

        // Convertir las fechasReservadas a objetos Date y actualizar el contexto
        if (datos.fechasReservadas) {
          const fechasComoDate = datos.fechasReservadas.map((fechaString: string) => {
            const [year, month, day] = fechaString.split("-").map(Number);
            return new Date(year, month - 1, day);
          });
          setFechasSeparadas(fechasComoDate);
        }
      }
    };
    consultarGlamping();
  }, [glampingId, setFechasSeparadas]);

  // 4. Estado para almacenar las fechas seleccionadas
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);

  // 5. Declaramos "hoy" usando useMemo
  const hoy = useMemo(() => {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }, []);

  // 6. Estados de Calendarios
  const [urlAirbnb, setUrlAirbnb] = useState("");
  const [urlBooking, setUrlBooking] = useState("");

  // 7. Estado para el control del modal (mostrar/ocultar)
  const [mostrarModal, setMostrarModal] = useState(false);

  // Al cargar la info, actualiza los valores de urlAirbnb y urlBooking
  useEffect(() => {
    if (informacionGlamping) {
      setUrlAirbnb(informacionGlamping.urlIcal || "");
      setUrlBooking(informacionGlamping.urlIcalBooking || "");
    }
  }, [informacionGlamping]);

  // URL de calendario Glamperos
  const urlGlamperos = glampingId
    ? `https://glamperosapi.onrender.com/ical/exportar/${glampingId}`
    : "";

  // =============================================================================
  //    GUARDA CALENDARIOS ENVIANDO TODOS LOS CAMPOS (FormData)
  // =============================================================================
  const actualizarCalendarios = async () => {
    if (!glampingId || !informacionGlamping) return;
     // Validar URLs antes de continuar
    if (urlAirbnb && !urlAirbnb.toLowerCase().includes("airbnb")) {
      Swal.fire({
        icon: "warning",
        title: "URL incorrecta",
        text: "Parece que pegaste mal el link de Airbnb. Asegúrate de copiarlo desde la sección correcta."
      });
      return;
    }

    if (urlBooking && !urlBooking.toLowerCase().includes("booking")) {
      Swal.fire({
        icon: "warning",
        title: "URL incorrecta",
        text: "Parece que pegaste mal el link de Booking. Verifica que sea la URL de calendario."
      });
      return;
    }

    try {
      // Creamos un FormData con todos los campos que el backend requiere
      const formData = new FormData();

      // Rellenar datos básicos: (ajusta según lo que tu API exija)
      formData.append("nombreGlamping", informacionGlamping.nombreGlamping ?? "");
      formData.append("tipoGlamping", informacionGlamping.tipoGlamping ?? "tienda");
      formData.append(
        "Cantidad_Huespedes",
        (informacionGlamping.Cantidad_Huespedes ?? 1).toString()
      );
      formData.append(
        "Cantidad_Huespedes_Adicional",
        (informacionGlamping.Cantidad_Huespedes_Adicional ?? 0).toString()
      );
      formData.append(
        "Acepta_Mascotas",
        informacionGlamping.Acepta_Mascotas ? "true" : "false"
      );
      formData.append(
        "precioEstandar",
        (informacionGlamping.precioEstandar ?? 60000).toString()
      );
      formData.append(
        "precioEstandarAdicional",
        (informacionGlamping.precioEstandarAdicional ?? 0).toString()
      );
      formData.append(
        "minimoNoches",
        (informacionGlamping.minimoNoches ?? 1).toString()
      );
      formData.append(
        "diasCancelacion",
        (informacionGlamping.diasCancelacion ?? 0).toString()
      );
      formData.append("descuento", (informacionGlamping.descuento ?? 0).toString());
      formData.append(
        "descripcionGlamping",
        informacionGlamping.descripcionGlamping ?? ""
      );
      formData.append("video_youtube", informacionGlamping.video_youtube ?? "sin video");

      // Amenidades
      if (informacionGlamping.amenidadesGlobal) {
        formData.append(
          "amenidadesGlobal",
          informacionGlamping.amenidadesGlobal.join(",")
        );
      } else {
        formData.append("amenidadesGlobal", "");
      }

      // Campos que se actualizan en este componente
      formData.append("urlIcal", urlAirbnb || "Sin url");
      formData.append("urlIcalBooking", urlBooking || "Sin url");

      // Hacemos el PUT como en ModificarGlamping
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/Datos/${glampingId}`,
        {
          method: "PUT",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar los calendarios");
      }

      Swal.fire({
        icon: "success",
        title: "Calendarios actualizados",
        text: "Las URLs de calendario fueron guardadas correctamente."
      }).then(() => window.location.reload());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar las URLs de calendario."
      });
    }
  };

  // =============================================================================
  //    SINCRONIZAR CALENDARIOS
  // =============================================================================

  const sincronizarCalendarios = async () => {
    try {
      if (!glampingId) throw new Error("Glamping no encontrado");
  
      const glamping = await ObtenerGlampingPorId(glampingId);
      if (!glamping) throw new Error("Glamping no encontrado");
  
      const resultados: { url: string; ok: boolean; mensaje: string }[] = [];
  
      for (const campo of ["urlIcal", "urlIcalBooking"]) {
        const valor = glamping[campo];
        const source = campo === "urlIcal" ? "airbnb" : "booking";
  
        if (typeof valor === "string") {
          const urls = valor.split("\n").map(linea => linea.trim()).filter(u => u && u.toLowerCase() !== "sin url");
  
          for (const url of urls) {
            const response = await fetch(
              `https://glamperosapi.onrender.com/ical/importar?glamping_id=${glampingId}&url_ical=${encodeURIComponent(url)}&source=${source}`,
              { method: "POST" }
            );
            const data = await response.json();
            resultados.push({
              url,
              ok: response.ok,
              mensaje: data.mensaje || data.detail
            });
          }
        }
      }
  
      const exitosos = resultados.filter(r => r.ok).length;
      Swal.fire({
        icon: "success",
        title: "Sincronización completada",
        html: `${exitosos} de ${resultados.length} URLs sincronizadas correctamente.`
      });
      window.location.reload();
    } catch (error) {
      Swal.fire("Error", "Ocurrió un error al sincronizar los calendarios.", "error");
    }
  };
  

  // =============================================================================
  //          LÓGICA DE FECHAS MANUALES (BLOQUEO / DESBLOQUEO)
  // =============================================================================

  // Función toggle para seleccionar/deseleccionar una fecha.
  // Si se mezcla manual con otras (p. ej. Airbnb/Booking), se reinicia la selección
  const toggleFecha = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split("T")[0];
    const nuevaEsBloqueada = isManualBloqueada(fechaStr);

    if (!fechasSeleccionadas.length) {
      setFechasSeleccionadas([fechaStr]);
    } else {
      const primera = fechasSeleccionadas[0];
      const seleccionActualBloqueada = isManualBloqueada(primera);
      if (nuevaEsBloqueada !== seleccionActualBloqueada) {
        setFechasSeleccionadas([fechaStr]);
      } else {
        setFechasSeleccionadas(prev =>
          prev.includes(fechaStr)
            ? prev.filter(f => f !== fechaStr)
            : [...prev, fechaStr]
        );
      }
    }
  };

  const isManualBloqueada = (fechaStr: string): boolean => {
    const manual = informacionGlamping?.fechasManual || fechasManualProp;
    return manual.includes(fechaStr);
  };

  // Bloquear Fechas
  const bloquearFechasAPI = async () => {
    if (!fechasSeleccionadas.length) return;
    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/fechasReservadasManual`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas: fechasSeleccionadas })
        }
      );
      if (!response.ok) throw new Error("Error al bloquear las fechas");
      Swal.fire({
        icon: "success",
        title: "Fechas bloqueadas",
        text: "Las fechas han sido bloqueadas correctamente."
      }).then(() => window.location.reload());
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al bloquear las fechas. Inténtalo de nuevo."
      });
    }
  };

  // Desbloquear Fechas
  const desbloquearFechasAPI = async () => {
    if (!fechasSeleccionadas.length) return;
    const fechasManual = informacionGlamping?.fechasManual || fechasManualProp;
    const noManual = fechasSeleccionadas.filter(f => !fechasManual.includes(f));
    if (noManual.length) {
      Swal.fire({
        icon: "error",
        title: "Fechas no desbloqueables",
        text: "Estas fechas no están marcadas como manuales: " + noManual.join(", ")
      });
      return;
    }
    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/eliminar_fechas_manual`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas_a_eliminar: fechasSeleccionadas })
        }
      );
      if (!response.ok) throw new Error("Error al desbloquear las fechas");
      Swal.fire({
        icon: "success",
        title: "Fechas desbloqueadas",
        text: "Las fechas han sido desbloqueadas correctamente."
      }).then(() => window.location.reload());
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron desbloquear las fechas. Inténtalo de nuevo."
      });
    }
  };

  // =============================================================================
  //          RENDERIZACIÓN DEL CALENDARIO
  // =============================================================================

  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>(
    []
  );
  useEffect(() => {
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);
    const mesesTemp: { mes: number; anio: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const nuevoMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + i, 1);
      mesesTemp.push({ mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() });
    }
    setMesesVisibles(mesesTemp);
  }, []);

  const renderizarCalendario = (mes: number, anio: number) => {
    const diasEnMes = [] as React.ReactElement[];
    const totalDiasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    for (let i = 0; i < primerDiaDelMes; i++) {
      diasEnMes.push(<div key={`vacio-${i}`} className="CalendarioGeneral2-dia-vacio" />);
    }
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      const estaDeshabilitada = fechaDia.getTime() <= hoy.getTime();
      const claseReserva = obtenerClasePorFecha(fechaDia);
      const noEditable =
        claseReserva === "CalendarioGeneral2-dia-reservada-airbnb" ||
        claseReserva === "CalendarioGeneral2-dia-reservada-booking";
      const disabled = estaDeshabilitada || noEditable;
      const claseSeleccionada =
        fechasSeleccionadas.includes(fechaDia.toISOString().split("T")[0]) && !noEditable
          ? " CalendarioGeneral2-dia-seleccionado"
          : "";
      diasEnMes.push(
        <button
          key={dia}
          className={`CalendarioGeneral2-dia ${claseReserva}${claseSeleccionada}${
            disabled ? " CalendarioGeneral2-dia-deshabilitado" : ""
          }`}
          onClick={() => !disabled && toggleFecha(fechaDia)}
          disabled={disabled}
        >
          {dia}
        </button>
      );
    }
    return diasEnMes;
  };

  const obtenerClasePorFecha = (fecha: Date): string => {
    const fechaStr = fecha.toISOString().split("T")[0];
    const manual = informacionGlamping?.fechasManual || fechasManualProp;
    const airbnb = informacionGlamping?.fechasAirbnb || fechasAirbnbProp;
    const booking = informacionGlamping?.fechasBooking || fechasBookingProp;
    if (manual.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-manual";
    if (airbnb.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-airbnb";
    if (booking.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-booking";
    return "";
  };

  // =============================================================================
  //          SIDEBAR (CONFIGURACIÓN) y MOBILE
  // =============================================================================

  const renderSidebar = () => (
    <div className="CalendarioGeneral2-sidebar-content">
      <h3>Configuración de Calendarios</h3>
      <div className="CalendarioGeneral2-field">
        <label htmlFor="urlAirbnb">Calendario Airbnb:</label>
        <input
          type="text"
          id="urlAirbnb"
          value={urlAirbnb}
          onChange={(e) => setUrlAirbnb(e.target.value)}
        />
      </div>

      <div className="CalendarioGeneral2-field">
        <label htmlFor="urlBooking">Calendario Booking:</label>
        <input
          type="text"
          id="urlBooking"
          value={urlBooking}
          onChange={(e) => setUrlBooking(e.target.value)}
        />
      </div>

      <div className="CalendarioGeneral2-field CalendarioGeneral2-copy-wrapper">
        <label>Calendario Glamperos:</label>
        <div className="CalendarioGeneral2-copy-field">
          <input type="text" readOnly value={urlGlamperos} />
          <button
            type="button"
            title="Copiar"
            className="CalendarioGeneral2-copy-button"
            onClick={() => {
              navigator.clipboard.writeText(urlGlamperos);
              Swal.fire({
                toast: true,
                icon: "success",
                title: "Copiado al portapapeles",
                position: "top-end",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
              });
            }}
          >
            <FaCopy />
          </button>
        </div>
      </div>


      <button className="CalendarioGeneral2-btn-guardar" onClick={actualizarCalendarios}>
        Guardar calendarios
      </button>
      <button className="CalendarioGeneral2-boton-sincronizar" onClick={sincronizarCalendarios}>
        ↻ Sincronizar calendarios
      </button>
    </div>
  );

  return (
    <div className="CalendarioGeneral2-contenedor">
      <h2 className="CalendarioGeneral2-titulo">
        Calendario {informacionGlamping?.nombreGlamping}
      </h2>

      <div className="CalendarioGeneral2-wrapper">
        {/* Calendario principal */}
        <div className="CalendarioGeneral2-calendario">
          <div className="CalendarioGeneral2-meses">
            {mesesVisibles.map(({ mes, anio }, idx) => (
              <div key={idx} className="CalendarioGeneral2-mes">
                <h3 className="CalendarioGeneral2-mes-titulo">
                  {new Date(anio, mes).toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric"
                  })}
                </h3>
                <div className="CalendarioGeneral2-grid">
                  {renderizarCalendario(mes, anio)}
                </div>
              </div>
            ))}
          </div>

          {/* Botones debajo del calendario */}
          <div className="CalendarioGeneral2-botones">
            <button
              className="CalendarioGeneral2-boton-borrar"
              onClick={() => setFechasSeleccionadas([])}
            >
              Borrar selección
            </button>
            {fechasSeleccionadas.length > 0 && (
              <>
                {isManualBloqueada(fechasSeleccionadas[0]) ? (
                  <button
                    className="CalendarioGeneral2-boton-desbloquear"
                    onClick={desbloquearFechasAPI}
                  >
                    Desbloquear Fechas
                  </button>
                ) : (
                  <button
                    className="CalendarioGeneral2-boton-bloquear"
                    onClick={bloquearFechasAPI}
                  >
                    Bloquear Fechas <GiCampingTent />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar en pantallas grandes */}
        <div className="CalendarioGeneral2-sidebar-container">{renderSidebar()}</div>
      </div>

      {/* Modo móvil: botón para abrir el sidebar */}
      <div className="CalendarioGeneral2-mobile-toggle">
        <button onClick={() => setMostrarModal(true)}>Otros Calendarios</button>
      </div>

      {mostrarModal && (
        <div className="CalendarioGeneral2-modal-overlay">
          <div className="CalendarioGeneral2-modal">
            <button
              className="CalendarioGeneral2-modal-close"
              onClick={() => setMostrarModal(false)}
            >
              X
            </button>
            {renderSidebar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioGeneral2;
