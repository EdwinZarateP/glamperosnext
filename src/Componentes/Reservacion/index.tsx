"use client";

import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "next/navigation";
// import { useSearchParams, useRouter } from "next/navigation";
import { decryptData } from "@/Funciones/Encryptacion";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import { CrearReserva } from "@/Funciones/CrearReserva";
import { ObtenerUsuarioPorId } from "@/Funciones/ObtenerUsuario";
import { ActualizarFechasReservadas } from "@/Funciones/ActualizarFechasReservadas";
import { ObtenerFechasReservadas } from "@/Funciones/ObtenerFechasReservadas";
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

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => mod.default as React.ComponentType<MyLottieProps>),
  { ssr: false }
);

const ConfettiEffect = dynamic(() => import("@/Componentes/ConfettiEffect"), { ssr: false });

interface Glamping {
  nombreGlamping: string;
  ciudad_departamento: string;
  imagenes: string[] | string | null;
  ubicacion: {
    lat: number;
    lng: number;
  };
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

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

// Llave pública de pruebas de Wompi
const PUBLIC_KEY = "pub_test_XqijBLlWjkdPW4ymCgi2XPTLLlN2ykne";

const Reservacion: React.FC<ReservacionProps> = ({ onLoaded }) => {
  const contexto = useContext(ContextoApp);
  const searchParams = useSearchParams();
  // const router = useRouter();

  const id_Cliente = Cookies.get("idUsuario");
  const telefonoUsuarioCookie = Cookies.get("telefonoUsuario");
  const nombreUsuarioCookie = Cookies.get("nombreUsuario");

  const [loading, setLoading] = useState(false);
  const [showConfetti, ] = useState(false);

  if (!contexto) {
    throw new Error(
      "ContextoApp no está disponible. Asegúrate de envolver tu aplicación con <ProveedorVariables>"
    );
  }

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

  const [glamping, setGlamping] = useState<Glamping | null>(null);
  const [propietario, setPropietario] = useState<Propietario | null>(null);
  const { verPolitica, setVerPolitica } = contexto;

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

  const formatoPesos = (valor: number): string => {
    return `${valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    })}`;
  };

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

  const handleConfirmarReserva = async () => {
    if (telefonoUsuarioCookie === "sintelefono") {
      Swal.fire({
        title: "😳 Estas muy cerca",
        text: "Es necesario registrar tu número de WhatsApp para enviarte los detalles de tu reserva y compartir tu contacto con el anfitrión.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return "No se ha registrado el teléfono";
    }

    if (!glamping) {
      console.error("No se encontraron datos del glamping.");
      return;
    }

    setLoading(true);

    try {
      const fechasReservadas = await ObtenerFechasReservadas(glampingId);
      const rangoSeleccionado = generarFechasRango(fechaInicioDesencriptada, fechaFinDesencriptada);
      rangoSeleccionado.pop();

      if (fechasReservadas && fechasReservadas.some((fecha) => rangoSeleccionado.includes(fecha))) {
        Swal.fire({
          title: "Fecha no disponible",
          text: "No se puede reservar las fechas seleccionadas porque ya están ocupadas.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      // 1) Crear la reserva en tu sistema (estado pendiente de pago)
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
      });

      if (!creacionReserva?.reserva) {
        console.error("Error al procesar la reserva.");
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
        })} - puedes contactar a tu huésped al WhatsApp ${telefonoUsuarioCookie ?? "sin teléfono"}`,
      });

      // 2) Abrir el widget de Wompi para pagar la reserva
      // Convertir el total a centavos (si totalFinalDesencriptado está en pesos)
      const montoPesos = Number(totalFinalDesencriptado);
      const montoCentavos = Math.round(montoPesos * 100);

      // Llamar al endpoint para generar la firma de integridad
      const responseWompi = await fetch(
        `https://glamperosapi.onrender.com/wompi/generar-firma?referencia=${creacionReserva.reserva.codigoReserva}&monto=${montoCentavos}&moneda=COP`
      );
      const dataWompi = await responseWompi.json();

      if (!dataWompi.firma_integridad) {
        console.error("No se pudo obtener la firma de integridad");
        Swal.fire({
          title: "Error",
          text: "No se pudo obtener la firma de integridad, intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      // Abrir el widget de Wompi para que el usuario realice el pago
      if (window.WidgetCheckout) {
        const checkout = new window.WidgetCheckout({
          currency: "COP",
          amountInCents: montoCentavos,
          reference: creacionReserva.reserva.codigoReserva,
          publicKey: PUBLIC_KEY,
          redirectUrl: "https://glamperos.com/gracias",
          signature: {
            integrity: dataWompi.firma_integridad,
          },
        });

        checkout.open((result: any) => {
          console.log("Resultado de la transacción:", result);
        });
      } else {
        console.error("El widget de Wompi no se ha cargado correctamente.");
        Swal.fire({
          title: "Error",
          text: "El widget de Wompi no se ha cargado, intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
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
              <span onClick={() => setVerPolitica(true)}>
                Ver Políticas de Cancelación
              </span>
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
