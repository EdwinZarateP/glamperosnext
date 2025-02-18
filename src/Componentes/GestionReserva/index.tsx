import React, { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import Swal from 'sweetalert2';
import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import { EliminarFechas } from "@/Funciones/EliminarFechas";
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

interface Glamping {
  _id: string;
  nombreGlamping: string;
  ciudad_departamento: string;
  diasCancelacion: number;
}

const GestionReserva: React.FC = () => {
  const searchParams = useSearchParams();
  const codigoReserva = searchParams.get("codigoReserva") || ""; 
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [glamping, setGlamping] = useState<Glamping | null>(null);
  const [error, setError] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState<string>('');
  const [mostrarFormularioCancelacion, setMostrarFormularioCancelacion] = useState<boolean>(false);
  const [telefonoAnfitrion, setTelefonoAnfitrion] = useState<string>("573197862921");
  const [nombreAnfitrion, setNombreAnfitrion] = useState<string>("573197862921");

  const motivosCancelacion = [
    "Cambio de planes",
    "Problemas de salud",
    "Problemas económicos",
    "Problemas de transporte",
    "Emergencia familiar",
    "Otro motivo"
  ];

  useEffect(() => {
    const obtenertelefonoAnfitrion = async () => {
      if (reserva?.idPropietario) {
        try {
          const respuesta = await fetch(`https://glamperosapi.onrender.com/usuarios/${reserva.idPropietario}`);
          if (!respuesta.ok) throw new Error('Error al obtener datos del usuario');
          const usuario = await respuesta.json();
          setTelefonoAnfitrion(usuario.telefono || "573125443396");
          setNombreAnfitrion(usuario.nombre || "Anfitrión");
        } catch (error) {
          console.error("Error obteniendo teléfono:", error);
        }
      }
    };
    obtenertelefonoAnfitrion();
  }, [reserva]);

  // Efecto para desplazarse al final cuando se muestre el formulario
  useEffect(() => {
    if (mostrarFormularioCancelacion) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [mostrarFormularioCancelacion]);

  const calcularFechaLimiteCancelacion = (): string => {
    if (!reserva || !glamping) return '';
    const fechaIngreso = new Date(reserva.FechaIngreso);
    const fechaLimite = new Date(fechaIngreso);
    fechaLimite.setDate(fechaIngreso.getDate() - glamping.diasCancelacion);
    return fechaLimite.toLocaleDateString('es-CO');
  };

  const manejarCancelacion = async () => {
    if (!reserva || !glamping) return;

    if (!motivoCancelacion) {
      Swal.fire({
        title: 'Motivo requerido',
        text: 'Debes seleccionar un motivo de cancelación',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Verificar si está dentro del período sin reembolso
    const fechaLimite = new Date(reserva.FechaIngreso);
    fechaLimite.setDate(fechaLimite.getDate() - glamping.diasCancelacion);
    const hoy = new Date();
    
    fechaLimite.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    if (hoy > fechaLimite) {
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Al cancelar ahora no recibirás reembolso, pues este glamping solo admitia cancelaciones hasta el ${fechaLimite.toLocaleDateString()}. ¿Deseas continuar?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar'
      });
      
      if (!confirmacion.isConfirmed) return;
    }

    try {
      const respuesta = await fetch(`https://glamperosapi.onrender.com/reservas/${reserva.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoReserva: 'Cancelada',
          ComentariosCancelacion: motivoCancelacion
        })
      });

      if (!respuesta.ok) throw new Error('Error al actualizar la reserva');

      await eliminarFechasReservadas(reserva.idGlamping, reserva.FechaIngreso, reserva.FechaSalida);

      if (glamping) {
        try {
          await enviarMensajeCancelacion(telefonoAnfitrion, nombreAnfitrion);
        } catch (error) {
          console.error("Error enviando mensaje:", error);
          Swal.fire({
            title: 'Mensaje no enviado',
            text: 'La reserva se canceló pero hubo un error enviando la notificación',
            icon: 'warning'
          });
        }
      }

      Swal.fire({
        title: '¡Cancelación exitosa!',
        text: 'Tu reserva ha sido cancelada correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => window.location.reload());

    } catch (err) {
      console.error("Error en cancelación:", err);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al procesar la cancelación',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      if (!codigoReserva) {
        setError('No se proporcionó un código de reserva');
        return;
      }
      
      setCargando(true);
      setError('');

      try {
        const respuestaReserva = await fetch(
          `https://glamperosapi.onrender.com/reservas/codigo/${codigoReserva}`
        );
        
        if (!respuestaReserva.ok) {
          throw new Error(respuestaReserva.status === 404 
            ? 'No se encontró una reserva con ese código' 
            : 'Error al obtener la reserva');
        }

        const datosReserva = await respuestaReserva.json();
        setReserva(datosReserva.reserva);

        const respuestaGlamping = await fetch(
          `https://glamperosapi.onrender.com/glampings/${datosReserva.reserva.idGlamping}`
        );

        if (!respuestaGlamping.ok) throw new Error('Error al obtener detalles del alojamiento');

        const datosGlamping = await respuestaGlamping.json();
        setGlamping({
          _id: datosGlamping._id,
          nombreGlamping: datosGlamping.nombreGlamping,
          ciudad_departamento: datosGlamping.ciudad_departamento,
          diasCancelacion: datosGlamping.diasCancelacion
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [codigoReserva]);

  const eliminarFechasReservadas = async (glampingId: string, fechaInicio: string, fechaFin: string) => {
    const fechasAEliminar: string[] = [];
    let fechaActual = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    fechaActual.setHours(0, 0, 0, 0);
    fechaFinDate.setHours(0, 0, 0, 0);

    while (fechaActual < fechaFinDate) { 
      const fechaStr = fechaActual.toISOString().split("T")[0];
      fechasAEliminar.push(fechaStr);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    if (fechasAEliminar.length > 0) {
      const resultado = await EliminarFechas(glampingId, fechasAEliminar);
      if (!resultado) console.error("❌ No se pudieron eliminar las fechas.");
    }
  };

  const enviarMensajeCancelacion = async (numero: string, nombre: string) => {
    const WHATSAPP_API_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN; // Cambio de import.meta.env a process.env
    if (!WHATSAPP_API_TOKEN) throw new Error('Token de WhatsApp no configurado');

    const nombreGlamping = glamping?.nombreGlamping || "Glamping";
    const fechaIngreso = reserva ? new Date(reserva.FechaIngreso).toLocaleDateString('es-CO') : "";
    const fechaSalida = reserva ? new Date(reserva.FechaSalida).toLocaleDateString('es-CO') : "";

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numero,
      type: "template",
      template: {
        name: "cancelacion_reserva_glamping",
        language: { code: "es_CO" },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: nombre.split(' ')[0] },
            { type: "text", text: nombreGlamping },
            { type: "text", text: fechaIngreso },
            { type: "text", text: fechaSalida }
          ]
        }]
      }
    };

    const response = await fetch('https://graph.facebook.com/v21.0/531912696676146/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }
  };

  // Calculamos si el botón debe mostrarse
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaIngreso = reserva ? new Date(reserva.FechaIngreso) : null;
  if (fechaIngreso) fechaIngreso.setHours(0, 0, 0, 0);

  const puedeCancelar = reserva?.EstadoReserva !== 'Cancelada' && 
                       fechaIngreso && 
                       hoy <= fechaIngreso;

  return (
    <div className="GestionReserva-contenedor">
      <h1 className="GestionReserva-titulo">Detalles de Reserva</h1>

      {cargando ? (
        <div className="GestionReserva-carga">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
          <p className="GestionReserva-cargando">Cargando información...</p>
        </div>
      ) : (
        <>
          {error && <p className="GestionReserva-error">⚠️ {error}</p>}

          {reserva && (
            <div className="GestionReserva-detalle">
              <div className="GestionReserva-seccion">
                <h2 className="GestionReserva-subtitulo">Información del Glamping</h2>
                {glamping ? (
                  <>
                    <p><strong>Nombre:</strong> {glamping.nombreGlamping}</p>
                    <p><strong>Ubicación:</strong> {glamping.ciudad_departamento}</p>
                    <p><strong>Política de cancelación:</strong> {glamping.diasCancelacion} días antes del check-in</p>
                    <p><strong>Último día para cancelar:</strong> {calcularFechaLimiteCancelacion()}</p>
                  </>
                ) : (
                  <p>Información del alojamiento no disponible</p>
                )}
              </div>

              <div className="GestionReserva-seccion">
                <h2 className="GestionReserva-subtitulo">Detalles de la Reserva</h2>
                <p><strong>Código:</strong> {reserva.codigoReserva}</p>
                <p><strong>Estado:</strong> 
                  <span style={{ color: reserva.EstadoReserva === "Cancelada" ? "red" : "black" }}>
                    {reserva.EstadoReserva}
                  </span>
                </p>
                <p><strong>Check-in:</strong> {new Date(reserva.FechaIngreso).toLocaleDateString('es-CO')}</p>
                <p><strong>Check-out:</strong> {new Date(reserva.FechaSalida).toLocaleDateString('es-CO')}</p>
                <p><strong>Noches:</strong> {reserva.Noches}</p>
                <p><strong>Valor total:</strong> ${reserva.ValorReserva.toLocaleString('es-CO')}</p>
              </div>

              <div className="GestionReserva-seccion">
                <h2 className="GestionReserva-subtitulo">Huéspedes</h2>
                <p><strong>Adultos:</strong> {reserva.adultos}</p>
                <p><strong>Niños:</strong> {reserva.ninos}</p>
                <p><strong>Bebés:</strong> {reserva.bebes}</p>
                <p><strong>Mascotas:</strong> {reserva.mascotas}</p>
              </div>

              {puedeCancelar && (
                <>
                  {!mostrarFormularioCancelacion && (
                    <span 
                      className="GestionReserva-enlace-cancelar"
                      onClick={() => setMostrarFormularioCancelacion(true)}
                    >
                      Cancelar reserva
                    </span>
                  )}

                  {mostrarFormularioCancelacion && (
                    <div className="GestionReserva-seccion GestionReserva-cancelacion">
                      <div className="GestionReserva-cancelacion-header">
                        <h2 className="GestionReserva-subtitulo">Cancelar Reserva</h2>
                        <button 
                          className="GestionReserva-cancelacion-cerrar"
                          onClick={() => setMostrarFormularioCancelacion(false)}
                        >
                          ✖
                        </button>
                      </div>

                      <div className="GestionReserva-formulario">
                        <select
                          value={motivoCancelacion}
                          onChange={(e) => setMotivoCancelacion(e.target.value)}
                          className="GestionReserva-select"
                        >
                          <option value="">Selecciona un motivo</option>
                          {motivosCancelacion.map((motivo, index) => (
                            <option key={index} value={motivo}>
                              {motivo}
                            </option>
                          ))}
                        </select>

                        <button 
                          onClick={manejarCancelacion}
                          className="GestionReserva-boton-cancelar"
                        >
                          Confirmar Cancelación
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {reserva.ComentariosCancelacion && reserva.ComentariosCancelacion !== "Sin comentario" && (
                <div className="GestionReserva-seccion">
                  <h2 className="GestionReserva-subtitulo">Comentarios de Cancelación</h2>
                  <p>{reserva.ComentariosCancelacion}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GestionReserva;