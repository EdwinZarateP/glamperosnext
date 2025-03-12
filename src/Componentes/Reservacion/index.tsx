"use client";

import { useEffect, useState, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { decryptData } from "@/Funciones/Encryptacion"; // Ajusta la ruta si es necesario
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import { CrearReserva } from "@/Funciones/CrearReserva";
import { ObtenerUsuarioPorId } from "@/Funciones/ObtenerUsuario";
import { ObtenerFechasReservadas } from "@/Funciones/ObtenerFechasReservadas";
import { ActualizarFechasReservadas } from "@/Funciones/ActualizarFechasReservadas";
import { enviarCorreoPropietario } from "@/Funciones/enviarCorreoPropietario";
import { enviarCorreoCliente } from "@/Funciones/enviarCorreoCliente";
import { enviarWhatAppCliente } from "@/Funciones/enviarWhatAppCliente";
import { enviarWhatsAppPropietario } from "@/Funciones/enviarWhatsAppPropietario";
import InputTelefono from "@/Componentes/InputTelefono/index";
import { ContextoApp } from "@/context/AppContext";
import Politicas from "@/Componentes/Politica/index";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import "./estilos.css";

// ------------------------------------------------------------------------
// Definición de tipos para Lottie y otros componentes
// ------------------------------------------------------------------------
interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}


const Lottie = dynamic<MyLottieProps>(
  () => import("lottie-react").then((mod) => mod.default as React.ComponentType<MyLottieProps>),
  { ssr: false }
);

const ConfettiEffect = dynamic(() => import("@/Componentes/ConfettiEffect"), { ssr: false });

// ------------------------------------------------------------------------
// Tipos para Glamping y Propietario
// ------------------------------------------------------------------------
interface Glamping {
  nombreGlamping: string;
  ciudad_departamento: string;
  imagenes: string[] | string | null;
  ubicacion: { lat: number; lng: number };
  direccion: string | null;
  propietario_id: string;
  diasCancelacion: number;
}

interface Propietario {
  nombreDueno: string;
  whatsapp: string;
  correoPropietario: string;
}

interface ReservacionProps {
  onLoaded?: () => void;
}

// ------------------------------------------------------------------------
// Declaración global para Wompi
// ------------------------------------------------------------------------
declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

// ------------------------------------------------------------------------
// Llave pública de pruebas de Wompi
// ------------------------------------------------------------------------
const PUBLIC_KEY = "pub_test_XqijBLlWjkdPW4ymCgi2XPTLLlN2ykne";

const Reservacion: React.FC<ReservacionProps> = ({ onLoaded }) => {
  const contexto = useContext(ContextoApp);
  const searchParams = useSearchParams();
  const router = useRouter();

  // ----------------------------------------------------------------------
  // Variables de estado
  // ----------------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const id_Cliente = Cookies.get("idUsuario");
  const telefonoUsuarioCookie = Cookies.get("telefonoUsuario");
  const nombreUsuarioCookie = Cookies.get("nombreUsuario");

  if (!contexto) {
    throw new Error("ContextoApp no está disponible.");
  }

  // ----------------------------------------------------------------------
  // Parámetros encriptados en la URL
  // ----------------------------------------------------------------------
  const glampingId = searchParams.get("glampingId") ?? "";
  const fechaInicioDesencriptada = searchParams.get("fechaInicio")
    ? decryptData(decodeURIComponent(searchParams.get("fechaInicio")!))
    : "";
  const fechaFinDesencriptada = searchParams.get("fechaFin")
    ? decryptData(decodeURIComponent(searchParams.get("fechaFin")!))
    : "";
  const totalFinalDesencriptado = searchParams.get("totalFinal")
    ? decryptData(decodeURIComponent(searchParams.get("totalFinal")!))
    : "0";
  const tarifaDesencriptada = searchParams.get("tarifa")
    ? decryptData(decodeURIComponent(searchParams.get("tarifa")!))
    : "0";
  const totalDiasDesencriptados = searchParams.get("totalDias")
    ? decryptData(decodeURIComponent(searchParams.get("totalDias")!))
    : "0";
  const adultosDesencriptados = searchParams.get("adultos")
    ? decryptData(decodeURIComponent(searchParams.get("adultos")!))
    : "0";
  const ninosDesencriptados = searchParams.get("ninos")
    ? decryptData(decodeURIComponent(searchParams.get("ninos")!))
    : "0";
  const bebesDesencriptados = searchParams.get("bebes")
    ? decryptData(decodeURIComponent(searchParams.get("bebes")!))
    : "0";
  const mascotasDesencriptadas = searchParams.get("mascotas")
    ? decryptData(decodeURIComponent(searchParams.get("mascotas")!))
    : "0";

  // ----------------------------------------------------------------------
  // Estados para glamping y propietario
  // ----------------------------------------------------------------------
  const [glamping, setGlamping] = useState<Glamping | null>(null);
  const [propietario, setPropietario] = useState<Propietario | null>(null);
  const { verPolitica, setVerPolitica } = contexto;

  // ----------------------------------------------------------------------
  // Cargar script de Wompi manualmente en useEffect
  // ----------------------------------------------------------------------
  useEffect(() => {
    const scriptId = "wompi-widget-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.onload = () => console.log("✅ Wompi script cargado correctamente");
      document.body.appendChild(script);
    }
  }, []);

  // ----------------------------------------------------------------------
  // Obtener datos de Glamping
  // ----------------------------------------------------------------------
  useEffect(() => {
    const fetchGlamping = async () => {
      if (glampingId) {
        try {
          const data: Glamping = await ObtenerGlampingPorId(glampingId);
          setGlamping(data);
        } catch (error) {
          console.error("Error fetching glamping:", error);
        }
      }
    };
    fetchGlamping();
  }, [glampingId]);

  // ----------------------------------------------------------------------
  // Obtener datos de Propietario
  // ----------------------------------------------------------------------
  useEffect(() => {
    const fetchPropietario = async () => {
      if (glamping?.propietario_id) {
        try {
          const data = await ObtenerUsuarioPorId(glamping.propietario_id);
          setPropietario({
            nombreDueno: data.nombre || "Usuario sin nombre",
            whatsapp: data.telefono || "Usuario sin teléfono",
            correoPropietario: data.email || "Usuario sin correo",
          });
          onLoaded?.();
        } catch (error) {
          console.error("Error fetching propietario:", error);
        }
      } else {
        onLoaded?.();
      }
    };
    fetchPropietario();
  }, [glamping, onLoaded]);

  // ----------------------------------------------------------------------
  // Formatear valores en pesos
  // ----------------------------------------------------------------------
  const formatoPesos = (valor: number): string => {
    return `${valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    })}`;
  };

  // ----------------------------------------------------------------------
  // Generar rango de fechas
  // ----------------------------------------------------------------------
  const generarFechasRango = (inicio: string, fin: string): string[] => {
    const fechas: string[] = [];
    let fechaActual = new Date(inicio);
    const fechaFin = new Date(fin);
    while (fechaActual <= fechaFin) {
      fechas.push(fechaActual.toISOString().split("T")[0]);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return fechas;
  };

  // ----------------------------------------------------------------------
  // Confirmar reserva: primero procesa el pago y, si es aprobado, guarda la reserva
  // ----------------------------------------------------------------------
  const handleConfirmarReserva = async () => {
    if (telefonoUsuarioCookie === "sintelefono") {
      Swal.fire({
        title: "😳 Estas muy cerca",
        text: "Es necesario registrar tu número de WhatsApp...",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (!glamping) {
      console.error("No se encontraron datos del glamping.");
      return;
    }

    setLoading(true);

    try {
      // 1) Validar fechas disponibles
      const fechasReservadas = await ObtenerFechasReservadas(glampingId);
      const rangoSeleccionado = generarFechasRango(fechaInicioDesencriptada, fechaFinDesencriptada);
      // Quitar el último día para no incluir la salida
      rangoSeleccionado.pop();

      if (fechasReservadas && fechasReservadas.some((f) => rangoSeleccionado.includes(f))) {
        Swal.fire({
          title: "Fecha no disponible",
          text: "No se puede reservar las fechas seleccionadas...",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      // 2) Generar una referencia única para el pago y la reserva
      const reservationReference = crypto.randomUUID();

      // 3) Calcular montos a pagar
      const montoPesos = Number(totalFinalDesencriptado);
      const montoCentavos = Math.round(montoPesos * 100);

      // 4) Llamar a backend para obtener la firma con la referencia generada
      const respFirma = await fetch(
        `https://glamperosapi.onrender.com/wompi/generar-firma?referencia=${reservationReference}&monto=${montoCentavos}&moneda=COP`
      );
      const dataFirma = await respFirma.json();

      if (!dataFirma.firma_integridad) {
        console.error("No se pudo obtener la firma de integridad");
        Swal.fire({
          title: "Error",
          text: "No se pudo obtener la firma de integridad...",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      // 5) Verificar que el script de Wompi esté cargado
      if (!window.WidgetCheckout) {
        console.error("El widget de Wompi no se ha cargado correctamente.");
        Swal.fire({
          title: "Error",
          text: "El widget de Wompi no se ha cargado, intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      // 6) Configurar y abrir el widget de Wompi usando la referencia generada
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: montoCentavos,
        reference: reservationReference,
        publicKey: PUBLIC_KEY,
        signature: {
          integrity: dataFirma.firma_integridad,
        },
      });

      checkout.open(async (result: any) => {
        console.log("Resultado de la transacción:", result);

        // Verificar que se reciba el id de la transacción
        if (result && result.transaction && result.transaction.id) {
          try {
            const transactionId = result.transaction.id;
            // Consultar el estado real de la transacción en la API de Wompi (sandbox)
            const response = await fetch(
              `https://sandbox.wompi.co/v1/transactions/${transactionId}`
            );
            const transactionData = await response.json();

            if (
              transactionData &&
              transactionData.data &&
              transactionData.data.status === "APPROVED"
            ) {
              // Pago aprobado: ahora se guarda la reserva en la base de datos
              const creacionReserva = await CrearReserva({
                idCliente: id_Cliente ?? "sin id",
                idPropietario: glamping.propietario_id ?? "Propietario no registrado",
                idGlamping: glampingId,
                ciudad_departamento: glamping.ciudad_departamento ?? "No tiene ciudad_departamento",
                fechaInicio: new Date(`${fechaInicioDesencriptada}T12:00:00`),
                fechaFin: new Date(`${fechaFinDesencriptada}T12:00:00`),
                totalDiasNum: Number(totalDiasDesencriptados),
                precioConTarifaNum: Number(totalFinalDesencriptado),
                TarifaGlamperosNum: Number(tarifaDesencriptada),
                adultosDesencriptados,
                ninosDesencriptados,
                bebesDesencriptados,
                mascotasDesencriptadas,
                codigoReserva: reservationReference // Se pasa la referencia generada
              });

              if (!creacionReserva?.reserva) {
                console.error("Error al procesar la reserva.");
                Swal.fire({
                  title: "Error",
                  text: "No se pudo crear la reserva tras el pago aprobado.",
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
                return;
              }

              await ActualizarFechasReservadas(glampingId, rangoSeleccionado);

              // Enviar correos y notificaciones (según tu lógica)
              await enviarCorreoPropietario({
                correo: propietario?.correoPropietario ?? "sin_correo@glamperos.com",
                nombre: propietario?.nombreDueno ?? "Propietario desconocido",
                codigoReserva: creacionReserva.reserva.codigoReserva,
                fechaInicio: new Date(`${fechaInicioDesencriptada}T12:00:00`),
                fechaFin: new Date(`${fechaFinDesencriptada}T12:00:00`),
                Cantidad_Adultos: Number(adultosDesencriptados),
                Cantidad_Ninos: Number(ninosDesencriptados),
                Cantidad_Mascotas: Number(mascotasDesencriptadas),
                telefonoUsuario: telefonoUsuarioCookie ?? "sin teléfono",
                correoUsuario: Cookies.get("correoUsuario") ?? "sin_correo@glamperos.com",
                glampingNombre: glamping.nombreGlamping ?? "Glamping sin nombre",
              });
        
              await enviarCorreoCliente({
                correo: propietario?.correoPropietario ?? "sin_correo@glamperos.com",
                nombre: propietario?.nombreDueno ?? "Propietario desconocido",
                codigoReserva: creacionReserva.reserva.codigoReserva,
                fechaInicio: new Date(`${fechaInicioDesencriptada}T12:00:00`),
                fechaFin: new Date(`${fechaFinDesencriptada}T12:00:00`),
                Cantidad_Adultos: Number(adultosDesencriptados),
                Cantidad_Ninos: Number(ninosDesencriptados),
                Cantidad_Mascotas: Number(mascotasDesencriptadas),
                usuarioWhatsapp: telefonoUsuarioCookie ?? "sin teléfono",
                glampingNombre: glamping.nombreGlamping ?? "Glamping sin nombre",
                latitud: Number(glamping?.ubicacion?.lat),
                longitud: Number(glamping?.ubicacion?.lng),
              });
        
              await enviarWhatAppCliente({
                numero: telefonoUsuarioCookie ?? "sin teléfono",
                codigoReserva: creacionReserva.reserva.codigoReserva,
                whatsapp: propietario?.whatsapp ?? "Propietario sin telefono",
                nombreGlampingReservado: glamping.nombreGlamping ?? "Glamping sin nombre",
                direccionGlamping: glamping.direccion ?? "Glamping sin direccion",
                latitud: Number(glamping?.ubicacion?.lat),
                longitud: Number(glamping?.ubicacion?.lng),
                nombreCliente: nombreUsuarioCookie ? nombreUsuarioCookie.split(" ")[0] : "Estimado(a)",
              });

              // 🔹 Remover el prefijo "57" si el número empieza con él
              let telefonoUsuarioFormateado = telefonoUsuarioCookie ?? "sin teléfono";
              if (telefonoUsuarioFormateado.startsWith("57")) {
                telefonoUsuarioFormateado = telefonoUsuarioFormateado.slice(2);
              }

              await enviarWhatsAppPropietario({
                numero: propietario?.whatsapp ?? "sin teléfono",
                nombrePropietario: propietario?.nombreDueno ? propietario.nombreDueno.split(" ")[0] : "Estimado(a)",
                nombreGlamping: glamping.nombreGlamping ?? "Glamping sin nombre",
                fechaInicio: new Date(`${fechaInicioDesencriptada}T12:00:00`).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
               fechaFin: `${new Date(`${fechaFinDesencriptada}T12:00:00`).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })} - puedes contactar a tu huésped al WhatsApp ${telefonoUsuarioFormateado}`,
              });

              setShowConfetti(true);
              setTimeout(() => {
                router.push("/gracias");
              }, 3000);
            } else {
              Swal.fire({
                title: "Pago no exitoso",
                text: "El pago no fue aprobado, por favor intente nuevamente.",
                icon: "error",
                confirmButtonText: "Aceptar",
              });
            }
          } catch (err) {
            console.error("Error consultando el estado de la transacción:", err);
            Swal.fire({
              title: "Error",
              text: "No se pudo verificar la transacción, intenta nuevamente.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          }
        } else {
          Swal.fire({
            title: "Pago no exitoso",
            text: "El pago no fue aprobado, por favor intente nuevamente.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        }
      });
    } catch (error) {
      console.error("Error en la reserva:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Reservacion-contenedor">
      {showConfetti && <ConfettiEffect />}
      {glamping && (
        <div className="Reservacion-card">
          <div className="Reservacion-imagen-container">
            <img
              src={
                Array.isArray(glamping.imagenes)
                  ? glamping.imagenes[0] ?? undefined
                  : glamping.imagenes ?? undefined
              }
              alt={glamping.nombreGlamping}
              className="Reservacion-imagen"
            />
            <div className="Reservacion-info-superpuesta">
              <h1>{glamping.nombreGlamping}</h1>
              <p>{glamping.ciudad_departamento}</p>
            </div>
          </div>

          <div className="Reservacion-detalles">
            <div className="Reservacion-factura">
              <h3>Detalles de la Reserva</h3>
              <p>
                <strong>
                  {formatoPesos(
                    Math.round(Number(totalFinalDesencriptado) / Number(totalDiasDesencriptados))
                  )}{" "}
                  / noche
                </strong>
              </p>
              <p>
                {new Date(`${fechaInicioDesencriptada}T12:00:00`).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                -{" "}
                {new Date(`${fechaFinDesencriptada}T12:00:00`).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <p>
                Tarifa de Glamperos:{" "}
                <strong>{formatoPesos(Math.round(Number(tarifaDesencriptada)))}</strong>
              </p>
              <p className="Reservacion-total">
                Total:{" "}
                <strong>{formatoPesos(Math.round(Number(totalFinalDesencriptado)))}</strong>
              </p>
            </div>

            <div className="Reservacion-boton-contenedor">
              {loading ? (
                <div className="lottie-container">
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                    style={{ height: 150, width: 150 }}
                  />
                  <p className="loading-text">Procesando tu reserva...</p>
                </div>
              ) : (
                <>
                  <InputTelefono />
                  <button className="Reservacion-boton" onClick={handleConfirmarReserva}>
                    Confirmar y pagar
                  </button>
                </>
              )}
            </div>

            <div className="Reservacion-politicas">
              <span onClick={() => setVerPolitica(true)}>Ver Políticas de Cancelación</span>
            </div>
          </div>
        </div>
      )}

      {verPolitica && (
        <Politicas
          diasCancelacion={glamping?.diasCancelacion ?? 5}
          fechaInicio={new Date(`${fechaInicioDesencriptada}T12:00:00`)}
        />
      )}
    </div>
  );
};

export default Reservacion;
