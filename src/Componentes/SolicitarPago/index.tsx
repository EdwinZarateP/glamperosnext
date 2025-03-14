"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Recomendado en Next.js 13 (app directory)
import Swal from "sweetalert2";
import "./estilos.css";
import { enviarCorreoContabilidad } from "@/Funciones/enviarCorreoContabilidad";

const API_URL = "https://glamperosapi.onrender.com";

// -------------------------
//   Tipos de datos
// -------------------------
interface SolicitudPago {
  _id?: string;
  idPropietario: string;
  MontoSolicitado: number;
  Estado: string;
  MetodoPago: string;
  FechaSolicitud: string;
  FechaPagoPropietario: string | null;
  ReferenciaPago: string | null;
  codigosReserva?: string[];
}

interface Banco {
  banco: string;
  numeroCuenta: string;
  tipoCuenta: string;
  tipoDocumento: string;
}

// -------------------------
//   Componente Principal
// -------------------------
const SolicitarPago = ({ idPropietario }: { idPropietario: string }) => {
  const router = useRouter();  // Hook de navegación
  const [saldo, setSaldo] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<string>("Cargando...");
  const [solicitudes, setSolicitudes] = useState<SolicitudPago[]>([]);
  const [numeroCuenta, setNumeroCuenta] = useState<string>("No disponible"); // Guarda el número de cuenta

  // -------------------------
  //   Efectos de carga
  // -------------------------
  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const response = await fetch(`${API_URL}/reservas/pendientes_pago/${idPropietario}`);
        if (!response.ok) {
          // Si el status es 404, no hay reservas pendientes, saldo=0
          if (response.status === 404) {
            setSaldo(0);
            return;
          }
          throw new Error("Error al obtener reservas pendientes");
        }
        const data = await response.json();
        const saldoPropietario = data.reduce(
          (acc: number, reserva: any) => acc + reserva.CostoGlamping,
          0
        );
        setSaldo(saldoPropietario);
      } catch (error) {
        console.error("Error al obtener saldo:", error);
      }
    };

    const fetchMetodoPago = async () => {
      try {
        const response = await fetch(`${API_URL}/usuarios/${idPropietario}/banco`);
        if (!response.ok) {
          // Si no existe info bancaria, se muestra "No registrado"
          setMetodoPago("No registrado");
          return;
        }
        const data: Banco = await response.json();
        setMetodoPago(`${data.banco} - ${data.tipoCuenta}`);
        setNumeroCuenta(data.numeroCuenta || "No disponible");
      } catch (error) {
        console.error("Error al obtener datos bancarios:", error);
        setMetodoPago("No registrado");
      }
    };

    const fetchSolicitudes = async () => {
      try {
        const response = await fetch(`${API_URL}/reservas/solicitudes_pago/${idPropietario}`);
        if (!response.ok) {
          if (response.status === 404) {
            setSolicitudes([]);
            return;
          }
          throw new Error("Error al obtener solicitudes de pago");
        }
        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error al obtener solicitudes de pago:", error);
      }
    };

    // Llamar a las funciones de carga inicial
    fetchSaldo();
    fetchMetodoPago();
    fetchSolicitudes();
  }, [idPropietario]);

  // -------------------------
  //   Recargar datos
  // -------------------------
  const recargarDatos = async () => {
    try {
      // Recarga de solicitudes
      const responseSolicitudes = await fetch(`${API_URL}/reservas/solicitudes_pago/${idPropietario}`);
      if (responseSolicitudes.ok) {
        const dataSolicitudes = await responseSolicitudes.json();
        setSolicitudes(dataSolicitudes);
      } else {
        setSolicitudes([]);
      }

      // Recarga de saldo
      const responseSaldo = await fetch(`${API_URL}/reservas/pendientes_pago/${idPropietario}`);
      if (responseSaldo.ok) {
        const dataSaldo = await responseSaldo.json();
        const saldoPropietario = dataSaldo.reduce(
          (acc: number, reserva: any) => acc + reserva.CostoGlamping,
          0
        );
        setSaldo(saldoPropietario);
      } else {
        setSaldo(0);
      }
    } catch (err) {
      console.error("Error al recargar datos:", err);
    }
  };

  // -------------------------
  //   Solicitar Pago
  // -------------------------
  const solicitarPago = async () => {
    // Verificar cuenta bancaria
    if (numeroCuenta === "No disponible") {
      Swal.fire({
        icon: "warning",
        title: "Cuenta bancaria no registrada",
        text: "Debes inscribir primero la cuenta de banco en Gestión de Bancos.",
        showCancelButton: true,
        confirmButtonText: "Ir a Gestión de Bancos",
        cancelButtonText: "Cerrar",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/GestionBancos");
        }
      });
      return;
    }

    // Verificar saldo
    if (saldo <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin Saldo",
        text: "No hay saldo disponible para retirar.",
      });
      return;
    }

    // Verificar que el método de pago no sea "Cargando..." o "No registrado"
    if (metodoPago === "Cargando..." || metodoPago === "No registrado") {
      Swal.fire({
        icon: "error",
        title: "Método de pago inválido",
        text: "No se ha registrado un método de pago válido.",
      });
      return;
    }

    // Llamar a la API para solicitar el pago
    try {
      const response = await fetch(`${API_URL}/reservas/solicitar_pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPropietario, metodoPago }),
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.detail || "Error al solicitar el pago",
        });
      } else {
        // data.solicitud contiene el objeto con toda la información
        const solicitud = data.solicitud;

        Swal.fire({
          icon: "success",
          title: "Solicitud Enviada",
          html: `<p>${data.mensaje}</p>
                 <p><strong>ID de Solicitud:</strong> ${solicitud._id}</p>
                 <p><strong>Códigos de Reservas:</strong><br/>${
                   solicitud.codigosReserva
                     ? solicitud.codigosReserva.join("<br/>")
                     : "No disponibles"
                 }</p>`,
          confirmButtonText: "Aceptar",
        });

        // Enviar correo a contabilidad con la información de la solicitud
        await enviarCorreoContabilidad({
          idSolicitud: solicitud._id,
          idPropietario,
          montoSolicitado: saldo,
          metodoPago,
          estado: solicitud.Estado,
          fechaSolicitud: solicitud.FechaSolicitud,
          fechaPago: solicitud.FechaPagoPropietario,
          referenciaPago: solicitud.ReferenciaPago,
          codigosReserva: solicitud.codigosReserva || [],
          numeroCuenta, // Enviar también el número de cuenta
        });
      }

      // Finalmente, recargar datos
      await recargarDatos();
    } catch (error) {
      console.error("Error al solicitar pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al solicitar el pago",
      });
    }
  };

  // -------------------------
  //   Ver detalles de solicitud
  // -------------------------
  const verDetalles = (solicitud: SolicitudPago) => {
    Swal.fire({
      title: "Detalles de la Solicitud",
      html: `<p><strong>ID de Solicitud:</strong> ${solicitud._id}</p>
             <p><strong>Monto Solicitado:</strong> $${solicitud.MontoSolicitado.toLocaleString()}</p>
             <p><strong>Códigos de Reservas:</strong><br/>${
               solicitud.codigosReserva
                 ? solicitud.codigosReserva.join("<br/>")
                 : "No disponible"
             }</p>
             <p><strong>Fecha de Solicitud:</strong> ${new Date(
               solicitud.FechaSolicitud
             ).toLocaleDateString()}</p>
             <p><strong>Estado:</strong> ${solicitud.Estado}</p>`,
      icon: "info",
      confirmButtonText: "Cerrar",
    });
  };

  // -------------------------
  //   Filtrar listas
  // -------------------------
  const solicitudesPendientes = solicitudes.filter((s) => s.Estado !== "Pagado");
  const solicitudesPagadas = solicitudes.filter((s) => s.Estado === "Pagado");

  // -------------------------
  //   Render del componente
  // -------------------------
  return (
    <div className="solicitar-pago-container">
      <h2 className="titulo">Solicitar Pago</h2>
      <p className="saldo-disponible">
        Saldo disponible: <strong>${saldo.toLocaleString()}</strong>
      </p>
      <p className="metodo-pago">
        Método de Pago: <strong>{metodoPago}</strong>
      </p>

      <button onClick={solicitarPago} className="btn-solicitar">
        Solicitar Retiro
      </button>

      {/* Solicitudes Pendientes */}
      {solicitudesPendientes.length > 0 && (
        <>
          <h3 className="titulo">Historial de Solicitudes Pendientes</h3>
          <ul className="lista-solicitudes">
            {solicitudesPendientes.map((solicitud, index) => (
              <li
                key={index}
                className="solicitud-item"
                onClick={() => verDetalles(solicitud)}
              >
                <strong>ID:</strong> {solicitud._id} <br />
                <strong>Monto:</strong> $
                {solicitud.MontoSolicitado.toLocaleString()} <br />
                <strong>Fecha Solicitud:</strong>{" "}
                {new Date(solicitud.FechaSolicitud).toLocaleDateString()} <br />
                <strong>Estado:</strong> {solicitud.Estado} <br />
                <em>(Clic para ver detalles)</em>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Solicitudes Pagadas */}
      {solicitudesPagadas.length > 0 && (
        <>
          <h3 className="titulo">Historial de Pagos Realizados</h3>
          <ul className="lista-solicitudes">
            {solicitudesPagadas.map((solicitud, index) => (
              <li
                key={index}
                className="solicitud-item"
                onClick={() => verDetalles(solicitud)}
              >
                <strong>ID:</strong> {solicitud._id} <br />
                <strong>Monto:</strong> $
                {solicitud.MontoSolicitado.toLocaleString()} <br />
                <strong>Fecha de Pago:</strong>{" "}
                {solicitud.FechaPagoPropietario
                  ? new Date(solicitud.FechaPagoPropietario).toLocaleDateString()
                  : "Sin Fecha"}{" "}
                <br />
                <strong>Referencia:</strong>{" "}
                {solicitud.ReferenciaPago || "Sin Referencia"} <br />
                <em>(Clic para ver detalles)</em>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SolicitarPago;
