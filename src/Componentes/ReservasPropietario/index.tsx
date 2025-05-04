"use client";
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import './estilos.css';

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

const Lottie = dynamic<MyLottieProps>(
  () => import("lottie-react").then(mod => mod.default as React.ComponentType<MyLottieProps>),
  { ssr: false }
);

interface Reserva {
  id: string;
  idCliente: string;
  idPropietario: string;
  idGlamping: string;
  ciudad_departamento: string;
  FechaIngreso: string;
  FechaSalida: string;
  Noches: number;
  ValorReserva: number;
  CostoGlamping: number;
  ComisionGlamperos: number;
  adultos: number;
  ninos: number;
  bebes: number;
  mascotas: number;
  EstadoReserva: string;
  fechaCreacion: string;
  codigoReserva: string;
  ComentariosCancelacion: string;
  EstadoPagoProp: string;
  FechaPagoPropietario: string;
}

interface GlampingData {
  _id: string;
  imagenes: string[];
  nombreGlamping: string;
  Acepta_Mascotas: boolean;
}

interface Reagendamiento {
  _id: string;
  codigoReserva: string;
  FechaIngreso: string;
  FechaSalida: string;
  estado: string; 
  fechaSolicitud: string;
}

const ReservasPropietario: React.FC = () => {
  const idPropietario = Cookies.get('idUsuario');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [glampingData, setGlampingData] = useState<GlampingData[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [telefonosClientes, setTelefonosClientes] = useState<Record<string, string>>({});
  const [reagendamientos, setReagendamientos] = useState<Reagendamiento[]>([]);

  const formatearFechaColombia = (fechaUTC: string) => {
    if (!fechaUTC) return "N/A";
    const fecha = new Date(fechaUTC);
    if (isNaN(fecha.getTime())) return "Inválida";
    fecha.setHours(fecha.getHours() - 5);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(fecha);
  };

  useEffect(() => {
    if (!idPropietario) {
      setCargando(false);
      return;
    }
    const obtenerReservas = async () => {
      try {
        const r = await fetch(`https://glamperosapi.onrender.com/reservas/documentos/${idPropietario}`);
        const data = await r.json();
        if (r.ok) {
          const ordenadas = data.sort((a: Reserva, b: Reserva) =>
            new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
          );
          setReservas(ordenadas);
        }
      } catch (error) {
        console.error("Error al obtener reservas:", error);
      }
      setCargando(false);
    };
    obtenerReservas();
  }, [idPropietario]);

  useEffect(() => {
    if (reservas.length > 0) {
      const obtenerGlamping = async (id: string) => {
        try {
          const r = await fetch(`https://glamperosapi.onrender.com/glampings/${id}`);
          const data = await r.json();
          if (r.ok) {
            setGlampingData(prev => [...prev, data]);
          }
        } catch (error) {
          console.error("Error al obtener glamping:", error);
        }
      };
      reservas.forEach(res => {
        if (!glampingData.find(g => g._id === res.idGlamping)) {
          obtenerGlamping(res.idGlamping);
        }
      });
    }
  }, [reservas, glampingData]);

  useEffect(() => {
    if (reservas.length === 0) return;
    const idsUnicos = Array.from(new Set(reservas.map(r => r.idCliente)));
    const obtenerTelefonos = async () => {
      const nuevos: Record<string, string> = {};
      for (const cId of idsUnicos) {
        try {
          const resp = await fetch(`https://glamperosapi.onrender.com/usuarios/${cId}`);
          const data = await resp.json();
          if (resp.ok && data.telefono) {
            nuevos[cId] = data.telefono.startsWith("57") ? data.telefono.substring(2) : data.telefono;
          } else {
            nuevos[cId] = 'No disponible';
          }
        } catch {
          nuevos[cId] = 'No disponible';
        }
      }
      setTelefonosClientes(nuevos);
    };
    obtenerTelefonos();
  }, [reservas]);

  // Consulta a reagendamientos
  useEffect(() => {
    if (!idPropietario) return;
    const obtenerReagendamientos = async () => {
      try {
        const r = await fetch(`https://glamperosapi.onrender.com/reservas/reagendamientos/todos`);
        const data = await r.json();
        if (r.ok && data.length > 0) {
          setReagendamientos(data);
        } else {
          console.warn("No hay reagendamientos pendientes.");
        }
      } catch (error) {
        console.error("Error al obtener reagendamientos:", error);
      }
    };
    obtenerReagendamientos();
  }, [idPropietario]);

  const manejarReagendamiento = async (reag: Reagendamiento, accion: "Aprobado" | "Rechazado", e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click se propague a la fila
    try {
      const bodyReq = { estado: accion };
      const resp = await fetch(`https://glamperosapi.onrender.com/reservas/reagendamientos/${reag.codigoReserva}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyReq)
      });
      const data = await resp.json();
      if (!resp.ok) {
        Swal.fire("Error", data.detail || "Error al actualizar reagendamiento", "error");
        return;
      }
      if (accion === "Aprobado") {
        const reservaOriginal = reservas.find(r => r.codigoReserva === reag.codigoReserva);
        if (!reservaOriginal) {
          Swal.fire("Error", "No se encontró la reserva original", "error");
          return;
        }
        const fechasAnt = generarFechasEntreRango(
          new Date(reservaOriginal.FechaIngreso),
          new Date(reservaOriginal.FechaSalida)
        );
        const fechasNuevas = generarFechasEntreRango(
          new Date(reag.FechaIngreso),
          new Date(reag.FechaSalida)
        );
        
        // Eliminar las fechas antiguas
        await fetch(`https://glamperosapi.onrender.com/glampings/${reservaOriginal.idGlamping}/eliminar_fechas_manual`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas_a_eliminar: fechasAnt })
        });
        // Añadir las fechas nuevas
        await fetch(`https://glamperosapi.onrender.com/glampings/${reservaOriginal.idGlamping}/fechasReservadasManual`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas: fechasNuevas })
        });
  
        Swal.fire({
          title: "Éxito",
          text: "Reagendamiento aprobado y fechas actualizadas",
          icon: "success",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: "Info",
          text: "Reagendamiento rechazado",
          icon: "info",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            window.location.reload();
          }
        });
      }
      setReagendamientos(prev => prev.filter(r => r.codigoReserva !== reag.codigoReserva));
    } catch {
      Swal.fire("Error", "Ocurrió un error al procesar la solicitud", "error");
    }
  };

  const generarFechasEntreRango = (inicio: Date, fin: Date) => {
    const arr: string[] = [];
    const unDia = 1000 * 60 * 60 * 24;
    for (let d = new Date(inicio); d < fin; d = new Date(d.getTime() + unDia)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      arr.push(`${y}-${m}-${dd}`);
    }
    return arr;
  };

  const reservasFiltradas = filtroEstado
    ? reservas.filter(r => r.EstadoReserva === filtroEstado)
    : reservas;

  const handleExportToExcel = () => {
    const exportData = reservasFiltradas.map(reserva => {
      const glamping = glampingData.find(g => g._id === reserva.idGlamping);
      const huespedes = [
        reserva.adultos > 0 ? `${reserva.adultos} Adulto${reserva.adultos > 1 ? "s" : ""}` : "",
        reserva.ninos > 0 ? `${reserva.ninos} Niño${reserva.ninos > 1 ? "s" : ""}` : "",
        reserva.bebes > 0 ? `${reserva.bebes} Bebé${reserva.bebes > 1 ? "s" : ""}` : "",
        reserva.mascotas > 0 ? `${reserva.mascotas} Mascota${reserva.mascotas > 1 ? "s" : ""}` : ""
      ].filter(Boolean).join(", ");
      return {
        Glamping: glamping?.nombreGlamping || '',
        Código: reserva.codigoReserva,
        "WhatsApp huésped": telefonosClientes[reserva.idCliente] || '...',
        "Fecha Creación": formatearFechaColombia(reserva.fechaCreacion),
        "Estado Reserva": reserva.EstadoReserva,
        Ciudad: reserva.ciudad_departamento,
        "Check-In": new Date(reserva.FechaIngreso).toLocaleDateString(),
        "Check-Out": new Date(reserva.FechaSalida).toLocaleDateString(),
        Huéspedes: huespedes,
        "Valor Reserva": `$${reserva.ValorReserva.toLocaleString()}`,
        Comisión: `$${reserva.ComisionGlamperos.toLocaleString()}`,
        "Tu Ganancia": `$${reserva.CostoGlamping.toLocaleString()}`,
        "Estado Pago": reserva.EstadoPagoProp,
        "Fecha de Pago": reserva.FechaPagoPropietario 
          ? new Date(reserva.FechaPagoPropietario).toLocaleDateString() 
          : "Aún no",
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    XLSX.writeFile(workbook, "reservas.xlsx");
  };

  const handleRowClick = (reserva: Reserva) => {
    const glamping = glampingData.find(g => g._id === reserva.idGlamping);
    const huespedes = [
      reserva.adultos > 0 ? `${reserva.adultos} Adulto${reserva.adultos > 1 ? "s" : ""}` : "",
      reserva.ninos > 0 ? `${reserva.ninos} Niño${reserva.ninos > 1 ? "s" : ""}` : "",
      reserva.bebes > 0 ? `${reserva.bebes} Bebé${reserva.bebes > 1 ? "s" : ""}` : "",
      reserva.mascotas > 0 ? `${reserva.mascotas} Mascota${reserva.mascotas > 1 ? "s" : ""}` : ""
    ].filter(Boolean).join(", ");

    Swal.fire({
      title: `Reserva: ${reserva.codigoReserva}`,
      html: `<p><strong>Glamping:</strong> ${glamping?.nombreGlamping || 'N/A'}</p>
             <p><strong>WhatsApp huésped:</strong> ${telefonosClientes[reserva.idCliente] || '...'}</p>
             <p><strong>Fecha Creación:</strong> ${formatearFechaColombia(reserva.fechaCreacion)}</p>
             <p><strong>Estado Reserva:</strong> ${reserva.EstadoReserva}</p>
             <p><strong>Ciudad:</strong> ${reserva.ciudad_departamento}</p>
             <p><strong>Check-In:</strong> ${new Date(reserva.FechaIngreso).toLocaleDateString()}</p>
             <p><strong>Check-Out:</strong> ${new Date(reserva.FechaSalida).toLocaleDateString()}</p>
             <p><strong>Huéspedes:</strong> ${huespedes}</p>
             <p><strong>Valor Reserva:</strong> $${reserva.ValorReserva.toLocaleString()}</p>
             <p><strong>Comisión:</strong> $${reserva.ComisionGlamperos.toLocaleString()}</p>
             <p><strong>Tu Ganancia:</strong> $${reserva.CostoGlamping.toLocaleString()}</p>
             <p><strong>Estado Pago:</strong> ${reserva.EstadoPagoProp}</p>
             <p><strong>Fecha de Pago:</strong> ${
               reserva.FechaPagoPropietario 
                 ? new Date(reserva.FechaPagoPropietario).toLocaleDateString() 
                 : "Aún no"
             }</p>`,
      confirmButtonText: "Cerrar"
    });
  };

  return (
    <div className="ReservasPropietario-container">
      {cargando ? (
        <div className="ReservasPropietario-cargando">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
        </div>
      ) : reservas.length === 0 ? (
        <div className="ReservasPropietario-sinReservas">
          <Image src={"https://storage.googleapis.com/glamperos-imagenes/Imagenes/dameTiempo.png"} alt="Meme" className="ReservasPropietario-imagen" width={300} height={300} />
          <p className="ReservasPropietario-mensaje">No tienes reservaciones aún</p>
        </div>
      ) : (
        <>
          <div className="ReservasPropietario-filtro">
            <label htmlFor="estadoReserva">Filtrar por estado: </label>
            <select
              id="estadoReserva"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Reservada">Reservada</option>
              <option value="Completada">Completada</option>
              <option value="Reagendado">Reagendado</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <div className="ReservasPropietario-tabla-container">
            <table className="ReservasPropietario-table">
              <thead>
                <tr>
                  <th>Glamping</th>
                  <th>Código</th>
                  <th>WhatsApp</th>
                  <th>Fecha Creación</th>
                  <th>Estado Reserva</th>
                  <th>Ciudad</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Huéspedes</th>
                  <th>Valor Reserva</th>
                  <th>Comisión</th>
                  <th>Tu Ganancia</th>
                  <th>Estado Pago</th>
                  <th>Fecha de Pago</th>
                  <th>Reagendamiento</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((reserva) => {
                  const glamping = glampingData.find(g => g._id === reserva.idGlamping);
                  const reagPendiente = reagendamientos.find(r => r.codigoReserva === reserva.codigoReserva);
                  const huespedes = [
                    reserva.adultos > 0 ? `${reserva.adultos} Adulto${reserva.adultos > 1 ? "s" : ""}` : "",
                    reserva.ninos > 0 ? `${reserva.ninos} Niño${reserva.ninos > 1 ? "s" : ""}` : "",
                    reserva.bebes > 0 ? `${reserva.bebes} Bebé${reserva.bebes > 1 ? "s" : ""}` : "",
                    reserva.mascotas > 0 ? `${reserva.mascotas} Mascota${reserva.mascotas > 1 ? "s" : ""}` : ""
                  ].filter(Boolean).join(", ");

                  // Verificar si existe un reagendamiento pendiente y asignar el color
                  const isReagendamiento = reagPendiente && reagPendiente.estado === "Pendiente Aprobacion";
                  const rowStyle = {
                    backgroundColor: isReagendamiento 
                      ? "#f8d7da" // rojo claro en caso de reagendamiento pendiente
                      : reserva.EstadoPagoProp === "Pagado"
                        ? "#d4edda"
                        : reserva.EstadoPagoProp === "Solicitado"
                          ? "#ffe5b4"
                          : "transparent",
                    cursor: "pointer"
                  };

                  return (
                    <tr key={reserva.id} style={rowStyle} onClick={() => handleRowClick(reserva)}>
                      <td>{glamping?.nombreGlamping || "N/A"}</td>
                      <td>{reserva.codigoReserva}</td>
                      <td>{telefonosClientes[reserva.idCliente] || "..."}</td>
                      <td>{formatearFechaColombia(reserva.fechaCreacion)}</td>
                      <td>{reserva.EstadoReserva}</td>
                      <td>{reserva.ciudad_departamento}</td>
                      <td>{new Date(reserva.FechaIngreso).toLocaleDateString()}</td>
                      <td>{new Date(reserva.FechaSalida).toLocaleDateString()}</td>
                      <td>{huespedes}</td>
                      <td>${reserva.ValorReserva.toLocaleString()}</td>
                      <td>${reserva.ComisionGlamperos.toLocaleString()}</td>
                      <td>${reserva.CostoGlamping.toLocaleString()}</td>
                      <td>{reserva.EstadoPagoProp}</td>
                      <td>
                        {reserva.FechaPagoPropietario 
                          ? new Date(reserva.FechaPagoPropietario).toLocaleDateString()
                          : "Aún no"}
                      </td>
                      <td>
                        {reagPendiente && reagPendiente.estado === "Pendiente Aprobacion" ? (
                          <div className="reagendamiento-container" onClick={(e) => e.stopPropagation()}>
                            <p><strong>Nuevo Check-In:</strong> {new Date(reagPendiente.FechaIngreso).toLocaleDateString()}</p>
                            <p><strong>Nuevo Check-Out:</strong> {new Date(reagPendiente.FechaSalida).toLocaleDateString()}</p>
                            <button className="boton-aprobar" onClick={(e) => manejarReagendamiento(reagPendiente, "Aprobado", e)}>
                              Aprobar
                            </button>
                            <button className="boton-rechazar" onClick={(e) => manejarReagendamiento(reagPendiente, "Rechazado", e)}>
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="ExportButton" onClick={handleExportToExcel}>
            Exportar a Excel
          </button>
        </>
      )}
    </div>
  );
};

export default ReservasPropietario;
