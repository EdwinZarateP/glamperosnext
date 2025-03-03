"use client";
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import './estilos.css';

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Transformamos la importación de `lottie-react` a un componente que acepte MyLottieProps
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      // forzamos el default a un componente tipado
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  {
    ssr: false,
  }
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

const ReservasPropietario: React.FC = () => {
  const idPropietario = Cookies.get('idUsuario');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [glampingData, setGlampingData] = useState<GlampingData[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  
  // Estado para almacenar los teléfonos de cada cliente (clave: idCliente, valor: teléfono)
  const [telefonosClientes, setTelefonosClientes] = useState<Record<string, string>>({});

  // --------- Función formatear fecha ---------
  const formatearFechaColombia = (fechaUTC: string) => {
    if (!fechaUTC) return "Fecha no disponible";
    const fecha = new Date(fechaUTC);
    if (isNaN(fecha.getTime())) return "Fecha inválida";
    // Ajuste manual de zona horaria (si lo necesitas)
    fecha.setHours(fecha.getHours() - 5);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(fecha);
  };

  // --------- Efecto para obtener las reservas ---------
  useEffect(() => {
    if (!idPropietario) {
      console.error('No se encontró el idPropietario en las cookies');
      setCargando(false);
      return;
    }

    const obtenerReservas = async () => {
      try {
        const response = await fetch(`https://glamperosapi.onrender.com/reservas/documentos/${idPropietario}`);
        const data = await response.json();
        if (response.ok) {
          // Ordenar reservas por fechaCreacion (más reciente primero)
          const reservasOrdenadas = data.sort(
            (a: Reserva, b: Reserva) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
          );
          setReservas(reservasOrdenadas);
        } else {
          console.error('No se pudieron obtener las reservas');
        }
      } catch (error) {
        console.error('Error al obtener reservas:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerReservas();
  }, [idPropietario]);

  // --------- Efecto para obtener datos de cada Glamping ---------
  useEffect(() => {
    if (reservas.length > 0) {
      const obtenerGlamping = async (glampingId: string) => {
        try {
          const response = await fetch(`https://glamperosapi.onrender.com/glampings/${glampingId}`);
          const data = await response.json();
          if (response.ok) {
            setGlampingData(prevData => [...prevData, data]);
          } else {
            console.error('No se pudo obtener la información del glamping');
          }
        } catch (error) {
          console.error('Error al obtener datos del glamping:', error);
        }
      };

      reservas.forEach(reserva => {
        if (!glampingData.find(g => g._id === reserva.idGlamping)) {
          obtenerGlamping(reserva.idGlamping);
        }
      });
    }
  }, [reservas, glampingData]);

  // --------- Efecto para obtener teléfonos de los clientes ---------
  useEffect(() => {
    if (reservas.length === 0) return;

    // Extraemos todos los ID de clientes en las reservas y los hacemos únicos
    const idsUnicos = Array.from(new Set(reservas.map(res => res.idCliente)));

    const obtenerTelefonos = async () => {
      const nuevosTelefonos: Record<string, string> = {};

      for (const clienteId of idsUnicos) {
        try {
          const resp = await fetch(`https://glamperosapi.onrender.com/usuarios/${clienteId}`);
          const data = await resp.json();
      
          if (resp.ok && data.telefono) {
            let telefonoLimpio = data.telefono.startsWith("57") ? data.telefono.substring(2) : data.telefono;
            nuevosTelefonos[clienteId] = telefonoLimpio;
          } else {
            nuevosTelefonos[clienteId] = 'No disponible';
          }
        } catch (error) {
          console.error(`Error al obtener el teléfono del cliente ${clienteId}:`, error);
          nuevosTelefonos[clienteId] = 'No disponible';
        }
      }      

      setTelefonosClientes(nuevosTelefonos);
    };

    obtenerTelefonos();
  }, [reservas]);

  // --------- Filtro de reservas por estado ---------
  const reservasFiltradas = filtroEstado
    ? reservas.filter(reserva => reserva.EstadoReserva === filtroEstado)
    : reservas;

  return (
    <div className="ReservasPropietario-container">
      {cargando ? (
        <div className="ReservasPropietario-cargando">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
        </div>
      ) : reservas.length === 0 ? (
        <div className="ReservasPropietario-sinReservas">
          <Image src={"/meme.jpg"} alt="Imagen divertida" className="ReservasPropietario-imagen" width={300} height={300} />
          <p className="ReservasPropietario-mensaje">No tienes reservaciones aún, trabajamos en hacerte más visible</p>
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

              return (
                <div key={reserva.id} className="ReservasPropietario-tarjeta" style={{ backgroundColor: colorEstado }}>
                  <h3 className="ReservasPropietario-titulo">{glamping.nombreGlamping}</h3>
                  <p className="ReservasPropietario-detalle">
                    <strong>Código Reserva:</strong> {reserva.codigoReserva}
                  </p>
                  {/* Aquí mostramos el teléfono del cliente */}
                  <p className="ReservasPropietario-detalle">
                    <strong>WhatsApp Cliente:</strong>{" "}
                    {telefonosClientes[reserva.idCliente] || 'Cargando...'}
                  </p>

                  <p className="ReservasPropietario-detalle">
                    <strong>La recibiste el:</strong> {formatearFechaColombia(reserva.fechaCreacion)}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Estado Reserva:</strong> {reserva.EstadoReserva}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Ciudad:</strong> {reserva.ciudad_departamento}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Check-In:</strong>{" "}
                    {new Date(reserva.FechaIngreso).toLocaleDateString()}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Check-Out:</strong>{" "}
                    {new Date(reserva.FechaSalida).toLocaleDateString()}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Huéspedes: </strong>
                    {reserva.adultos > 0 && `${Number(reserva.adultos)} ${Number(reserva.adultos) === 1 ? 'Adulto' : 'Adultos'}`}
                    {reserva.ninos > 0 && `, ${reserva.ninos} ${Number(reserva.ninos) === 1 ? 'Niño' : 'Niños'}`}
                    {reserva.bebes > 0 && `, ${reserva.bebes} ${Number(reserva.bebes) === 1 ? 'Bebé' : 'Bebés'}`}
                    {reserva.mascotas > 0 && ` y ${reserva.mascotas} Mascota${Number(reserva.mascotas) > 1 ? "s" : ""}`}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Valor Reserva:</strong> ${reserva.ValorReserva.toLocaleString()}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Comisión Glamperos:</strong> ${reserva.ComisionGlamperos.toLocaleString()}
                  </p>
                  <p className="ReservasPropietario-detalle">
                    <strong>Tu pago será:</strong> ${reserva.CostoGlamping.toLocaleString()}
                  </p>
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
