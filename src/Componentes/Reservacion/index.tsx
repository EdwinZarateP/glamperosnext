"use client";

import { useEffect, useState, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { decryptData } from "@/Funciones/Encryptacion";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import { CrearReserva } from "@/Funciones/CrearReserva"; 
import { ObtenerUsuarioPorId } from "@/Funciones/ObtenerUsuario";
import { ObtenerFechasReservadas } from "@/Funciones/ObtenerFechasReservadas";
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
  () => import("lottie-react").then((mod) => mod.default as React.ComponentType<MyLottieProps>),
  { ssr: false }
);

const ConfettiEffect = dynamic(() => import("@/Componentes/ConfettiEffect"), { ssr: false });

interface Glamping {
  tipoGlamping: string;
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

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

const PUBLIC_KEY = "pub_test_XqijBLlWjkdPW4ymCgi2XPTLLlN2ykne";

const Reservacion: React.FC<ReservacionProps> = ({ onLoaded }) => {
  const contexto = useContext(ContextoApp);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const id_Cliente = Cookies.get("idUsuario");
  const telefonoUsuarioCookie = Cookies.get("telefonoUsuario");

  if (!contexto) {
    throw new Error("ContextoApp no está disponible.");
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
  const [ , setPropietario] = useState<Propietario | null>(null);
  const { verPolitica, setVerPolitica } = contexto;

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    if (status === "APPROVED") {
      setShowConfetti(true);
      setTimeout(() => {
        router.push("/gracias");
      }, 1000);
    }
  }, [router]);

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

  // Función para formatear la cantidad de huéspedes
  const formatHuespedes = () => {
    const adultos = Number(adultosDesencriptados);
    const ninos = Number(ninosDesencriptados);
    const bebes = Number(bebesDesencriptados);
    const mascotas = Number(mascotasDesencriptadas);
    const partes: string[] = [];
    if (adultos > 0) partes.push(`${adultos} ${adultos === 1 ? "adulto" : "adultos"}`);
    if (ninos > 0) partes.push(`${ninos} ${ninos === 1 ? "niño" : "niños"}`);
    if (bebes > 0) partes.push(`${bebes} ${bebes === 1 ? "bebé" : "bebés"}`);
    if (mascotas > 0) partes.push(`${mascotas} ${mascotas === 1 ? "mascota" : "mascotas"}`);
    return partes.join(", ");
  };

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
      const fechasReservadas = await ObtenerFechasReservadas(glampingId);
      const rangoSeleccionado = generarFechasRango(
        fechaInicioDesencriptada,
        fechaFinDesencriptada
      );
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

      const reservationReference = crypto.randomUUID();

      const creacionReserva = await CrearReserva({
        idCliente: id_Cliente ?? "sin id",
        idPropietario: glamping.propietario_id ?? "Propietario no registrado",
        idGlamping: glampingId,
        ciudad_departamento: glamping.ciudad_departamento ?? "No tiene ciudad_departamento",
        fechaInicio: new Date(`${fechaInicioDesencriptada}T12:00:00Z`), // 🔥 Añadimos 'Z' para indicar UTC
        fechaFin: new Date(`${fechaFinDesencriptada}T12:00:00Z`),
        totalDiasNum: Number(totalDiasDesencriptados),
        precioConTarifaNum: Number(totalFinalDesencriptado),
        TarifaGlamperosNum: Number(tarifaDesencriptada),
        adultosDesencriptados,
        ninosDesencriptados,
        bebesDesencriptados,
        mascotasDesencriptadas,
        codigoReserva: reservationReference,
        EstadoPago: "Pendiente",
      });

      if (!creacionReserva?.reserva) {
        console.error("Error al procesar la reserva previa.");
        Swal.fire({
          title: "Error",
          text: "No se pudo crear la reserva previa al pago.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      const montoPesos = Number(totalFinalDesencriptado);
      const montoCentavos = Math.round(montoPesos * 100);

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

      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: montoCentavos,
        reference: reservationReference,
        publicKey: PUBLIC_KEY,
        signature: {
          integrity: dataFirma.firma_integridad,
        },
        redirectUrl: "https://glamperos.com/gracias",
      });

      checkout.open(async (result: any) => {
        console.log("Resultado de la transacción:", result);
        if (result && result.transaction && result.transaction.id) {
          try {
            const transactionId = result.transaction.id;
            const response = await fetch(`https://sandbox.wompi.co/v1/transactions/${transactionId}`);
            const transactionData = await response.json();
            const estadoPago = transactionData?.data?.status;

            if (estadoPago === "APPROVED") {
              let telefonoUsuarioFormateado = telefonoUsuarioCookie ?? "sin teléfono";
              if (telefonoUsuarioFormateado.startsWith("57")) {
                telefonoUsuarioFormateado = telefonoUsuarioFormateado.slice(2);
              }
              
              setShowConfetti(true);
              setTimeout(() => {
                router.push("/gracias");
              }, 1000);
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
      console.error("Error al crear la reserva y procesar el pago:", error);
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
              alt={glamping.tipoGlamping}
              className="Reservacion-imagen"
            />
            <div className="Reservacion-info-superpuesta">
              <h1>{glamping.tipoGlamping}</h1>
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
                Tarifa de Glamperos:{" "}{formatoPesos(Math.round(Number(tarifaDesencriptada)))}
              </p>
              {/* Aquí mostramos la cantidad de huéspedes formateada */}
              <p>
                <strong>Huéspedes:</strong> {formatHuespedes()}
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
