"use client";

import React, { useState, useEffect, useContext } from 'react';
import { ContextoApp } from "@/context/AppContext";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import EvaluarGlamping from "@/Componentes/EvaluarGlamping/index";

import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import './estilos.css';

// Tipado para lottie-react
interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Carga dinámica de lottie-react para animaciones
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
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
  // imagenes: string[];  // Eliminado: no necesitamos las imágenes
  nombreGlamping: string;
  Acepta_Mascotas: boolean;
  diasCancelacion: number;
}

interface EvaluacionResponse {
  tiene_calificacion: boolean;
}

const ReservasCliente: React.FC = () => {
  const idCliente = Cookies.get('idUsuario');
  const nombreUsuario = Cookies.get('nombreUsuario');

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [glampingData, setGlampingData] = useState<GlampingData[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState<boolean>(true);
  
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<{ [codigoReserva: string]: boolean }>({});

  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }
  const { activarCalificacion, setActivarCalificacion } = almacenVariables;
  const router = useRouter();

  // 1) Obtener reservas del cliente
  useEffect(() => {
    if (!idCliente) {
      console.error('No se encontró el idCliente en las cookies');
      setCargando(false);
      return;
    }

    const obtenerReservas = async () => {
      try {
        const response = await fetch(`https://glamperosapi.onrender.com/reservas/documentos_cliente/${idCliente}`);
        const data = await response.json();
        if (response.ok) {
          setReservas(data);
          verificarEvaluaciones(data);
        } else {
          console.error('No se pudieron obtener las reservas');
          setCargando(false);
        }
      } catch (error) {
        console.error('Error al obtener reservas:', error);
        setCargando(false);
      }
    };
  
    obtenerReservas();
  }, [idCliente]);

  // 2) Verificar si cada reserva ya tiene calificación
  const verificarEvaluaciones = async (reservas: Reserva[]) => {
    const evaluacionesTemp: { [codigoReserva: string]: boolean } = {};

    for (const reserva of reservas) {
      try {
        const response = await fetch(`https://glamperosapi.onrender.com/evaluaciones/codigoReserva/${reserva.codigoReserva}/tieneCalificacion`);
        const data: EvaluacionResponse = await response.json();
        evaluacionesTemp[reserva.codigoReserva] = data.tiene_calificacion;
      } catch (error) {
        console.error('Error al verificar evaluación:', error);
        evaluacionesTemp[reserva.codigoReserva] = false;
      }
    }

    setEvaluaciones(evaluacionesTemp);
    setCargandoEvaluaciones(false);
  };

  // 3) Una vez que cargamos las evaluaciones, dejamos de mostrar la animación
  useEffect(() => {
    if (!cargandoEvaluaciones) {
      setCargando(false);
    }
  }, [cargandoEvaluaciones]);

  // 4) Obtener datos de cada glamping en las reservas
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
  }, [reservas]);

  // 5) Calcular la fecha límite para cancelar
  const calcularFechaCancelacion = (reserva: Reserva, diasCancelacion: number) => {
    if (reserva.EstadoReserva === "Reagendado") return "Sin plazo";
    if (diasCancelacion <= 0) return "No aplica";
    const fecha = new Date(reserva.FechaIngreso);
    fecha.setDate(fecha.getDate() - diasCancelacion);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  

  // 6) Determina si se muestra el botón de calificación
  const mostrarBotonCalificar = (reserva: Reserva) => {
    const hoy = new Date();
    const fechaSalida = new Date(reserva.FechaSalida);

    // Permitir calificar desde un día antes de la FechaSalida
    const fechaInicioCalificacion = new Date(fechaSalida);
    fechaInicioCalificacion.setDate(fechaInicioCalificacion.getDate() - 1);

    // Permitir calificar hasta 15 días después de la FechaSalida
    const fechaLimiteCalificacion = new Date(fechaSalida);
    fechaLimiteCalificacion.setDate(fechaLimiteCalificacion.getDate() + 15);

    // No mostrar si la reserva está cancelada
    if (reserva.EstadoReserva === 'Cancelada') return false;

    // No mostrar si ya tiene una calificación
    if (evaluaciones[reserva.codigoReserva]) return false;

    // Mostrar solo si estamos en el rango válido
    return hoy >= fechaInicioCalificacion && hoy <= fechaLimiteCalificacion;
  };

  // Render principal
  return (
    <div className="ReservasCliente-container">
      {cargando ? (
        <div className="ReservasCliente-cargando">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
        </div>
      ) : reservas.length === 0 ? (
        <div className="ReservasCliente-sinReservas">
          {/* Dejamos esta imagen sólo para la sección "No hay reservas" */}
          <img
            src={"/meme.jpg"}
            alt="Imagen divertida"
            className="ReservasCliente-imagen"
          />
          <p className="ReservasCliente-mensaje">
            No tienes reservas ¿Qué esperas para ir a ese lugar soñado?
          </p>
        </div>
      ) : (
        <div className="ReservasCliente-lista">
          {reservas.map((reserva) => {
            const glamping = glampingData.find(g => g._id === reserva.idGlamping);
            if (!glamping) return null;

            return (
              <div key={reserva.id} className="ReservasCliente-tarjeta">
                <h3 className="ReservasCliente-titulo">
                  {glamping.nombreGlamping}
                </h3>

                <p
                  className="ReservasCliente-detalle"
                  onClick={() => router.push(`/GestionarReserva?codigoReserva=${encodeURIComponent(reserva.codigoReserva)}`)}
                >
                  <strong>Código Reserva:</strong> {reserva.codigoReserva}
                </p>
                <p
                  className="ReservasCliente-detalle"
                  onClick={() => router.push(`/GestionarReserva?codigoReserva=${encodeURIComponent(reserva.codigoReserva)}`)}
                >
                  <strong>Estado Reserva:</strong> {reserva.EstadoReserva}
                </p>
                <p
                  className="ReservasCliente-detalle"
                  onClick={() => router.push(`/GestionarReserva?codigoReserva=${encodeURIComponent(reserva.codigoReserva)}`)}
                >
                  <strong>Ciudad:</strong> {reserva.ciudad_departamento}
                </p>
                <p
                  className="ReservasCliente-detalle"
                  onClick={() => router.push(`/GestionarReserva?codigoReserva=${encodeURIComponent(reserva.codigoReserva)}`)}
                >
                  <strong>Fechas:</strong> {new Date(reserva.FechaIngreso).toLocaleDateString()} -{" "}
                  {new Date(reserva.FechaSalida).toLocaleDateString()}
                </p>
                <p
                  className="ReservasCliente-detalle"
                  onClick={() => router.push(`/GestionarReserva?codigoReserva=${encodeURIComponent(reserva.codigoReserva)}`)}
                >
                  <strong>Plazo para cancelar:</strong>{" "}
                  {calcularFechaCancelacion(reserva, glamping.diasCancelacion || 0)}
                </p>
                <p
                  className="ReservasCliente-detalle"
                  onClick={() => router.push(`/GestionarReserva?codigoReserva=${encodeURIComponent(reserva.codigoReserva)}`)}
                >
                  <strong>Valor Total:</strong> ${reserva.ValorReserva.toLocaleString()}
                </p>

                {/* En lugar de la imagen carrusel, un botón discreto */}
                <button
                  className="ReservasCliente-boton-ver"
                  onClick={() => router.push(`/GestionarReserva?codigoReserva=${encodeURIComponent(reserva.codigoReserva)}`)}
                >
                  Ver Reserva
                </button>

                {mostrarBotonCalificar(reserva) && (
                  <button
                    className="ReservasCliente-boton-calificar"
                    onClick={() => {
                      setSelectedReserva(reserva);
                      setActivarCalificacion(true);
                    }}
                  >
                    Calificar Estancia
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activarCalificacion && selectedReserva && (
        <EvaluarGlamping
          usuario_id={selectedReserva.idCliente}
          codigoReserva={selectedReserva.codigoReserva}
          nombre_usuario={nombreUsuario || ''}
          glamping_id={selectedReserva.idGlamping}
        />
      )}
    </div>
  );
};

export default ReservasCliente;
