"use client";
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
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
      } catch {}
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
        } catch {}
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

  const manejarReagendamiento = async (reag: Reagendamiento, accion: "Aprobado" | "Rechazado") => {
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
        await fetch(`https://glamperosapi.onrender.com/glampings/${reservaOriginal.idGlamping}/eliminar_fechas`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas_a_eliminar: fechasAnt })
        });
        // Añadir las fechas nuevas
        await fetch(`https://glamperosapi.onrender.com/glampings/${reservaOriginal.idGlamping}/fechasReservadas`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas: fechasNuevas })
        });

        Swal.fire("Éxito", "Reagendamiento aprobado y fechas actualizadas", "success");
      } else {
        Swal.fire("Info", "Reagendamiento rechazado", "info");
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
          <Image src={"/meme.jpg"} alt="Meme" className="ReservasPropietario-imagen" width={300} height={300} />
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
              <option value="Finalizada">Finalizada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="ReservasPropietario-lista">
            {reservasFiltradas.map((reserva) => {
              const glamping = glampingData.find(g => g._id === reserva.idGlamping);
              if (!glamping) return null;
              const colorEstado =
                reserva.EstadoReserva === "Cancelada"
                  ? "#e0e0e0"
                  : reserva.EstadoReserva === "Finalizada"
                  ? "rgba(47, 107, 62, 0.2)"
                  : "white";

              const reagPendiente = reagendamientos.find(r => r.codigoReserva === reserva.codigoReserva);

              return (
                <div
                  key={reserva.id}
                  className="ReservasPropietario-tarjeta"
                  style={{ backgroundColor: colorEstado }}
                >
                  <h3 className="ReservasPropietario-titulo">{glamping.nombreGlamping}</h3>
                  <p className="ReservasPropietario-detalle"><strong>Código:</strong> {reserva.codigoReserva}</p>
                  <p className="ReservasPropietario-detalle"><strong>WhatsApp:</strong> {telefonosClientes[reserva.idCliente] || '...'}</p>
                  <p className="ReservasPropietario-detalle"><strong>Fecha Creación:</strong> {formatearFechaColombia(reserva.fechaCreacion)}</p>
                  <p className="ReservasPropietario-detalle"><strong>Estado Reserva:</strong> {reserva.EstadoReserva}</p>
                  <p className="ReservasPropietario-detalle"><strong>Ciudad:</strong> {reserva.ciudad_departamento}</p>
                  <p className="ReservasPropietario-detalle"><strong>Check-In:</strong> {new Date(reserva.FechaIngreso).toLocaleDateString()}</p>
                  <p className="ReservasPropietario-detalle"><strong>Check-Out:</strong> {new Date(reserva.FechaSalida).toLocaleDateString()}</p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Huéspedes:</strong> 
                    {reserva.adultos > 0 && ` ${reserva.adultos} Adultos`}
                    {reserva.ninos > 0 && `, ${reserva.ninos} Niños`}
                    {reserva.bebes > 0 && `, ${reserva.bebes} Bebés`}
                    {reserva.mascotas > 0 && `, ${reserva.mascotas} Mascota(s)`}
                  </p>
                  <p className="ReservasPropietario-detalle"><strong>Valor:</strong> ${reserva.ValorReserva.toLocaleString()}</p>
                  <p className="ReservasPropietario-detalle"><strong>Comisión:</strong> ${reserva.ComisionGlamperos.toLocaleString()}</p>
                  <p className="ReservasPropietario-detalle"><strong>Pago Propietario:</strong> ${reserva.CostoGlamping.toLocaleString()}</p>

                  {reagPendiente && reagPendiente.estado === "Pendiente Aprobacion" && (
                    <div className="ReservasPropietario-reagendamiento">
                      <p><strong>Solicitud de Reagendamiento</strong></p>
                      <p>Nuevo Check-In: {new Date(reagPendiente.FechaIngreso).toLocaleDateString()}</p>
                      <p>Nuevo Check-Out: {new Date(reagPendiente.FechaSalida).toLocaleDateString()}</p>
                      <button className="boton-aprobar" onClick={() => manejarReagendamiento(reagPendiente, "Aprobado")}>
                        Aprobar
                      </button>
                      <button className="boton-rechazar" onClick={() => manejarReagendamiento(reagPendiente, "Rechazado")}>
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ReservasPropietario;
