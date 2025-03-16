"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; // Asegúrate de instalar la librería: npm install xlsx
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
  const router = useRouter();
  const [saldo, setSaldo] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<string>("Cargando...");
  const [solicitudes, setSolicitudes] = useState<SolicitudPago[]>([]);
  const [numeroCuenta, setNumeroCuenta] = useState<string>("No disponible");
  const [banco, setBanco] = useState<string>(""); // Para mostrar el banco en la tabla

  // -------------------------
  //   Efectos de carga
  // -------------------------
  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const response = await fetch(
          `${API_URL}/reservas/pendientes_pago/${idPropietario}`
        );
        if (!response.ok) {
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
        const response = await fetch(
          `${API_URL}/usuarios/${idPropietario}/banco`
        );
        if (!response.ok) {
          setMetodoPago("No registrado");
          return;
        }
        const data: Banco = await response.json();
        setMetodoPago(`${data.banco} - ${data.tipoCuenta}`);
        setNumeroCuenta(data.numeroCuenta || "No disponible");
        setBanco(data.banco || "");
      } catch (error) {
        console.error("Error al obtener datos bancarios:", error);
        setMetodoPago("No registrado");
      }
    };

    const fetchSolicitudes = async () => {
      try {
        const response = await fetch(
          `${API_URL}/reservas/solicitudes_pago/${idPropietario}`
        );
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

    // Llamadas iniciales
    fetchSaldo();
    fetchMetodoPago();
    fetchSolicitudes();
  }, [idPropietario]);

  // -------------------------
  //   Recargar datos
  // -------------------------
  const recargarDatos = async () => {
    try {
      const responseSolicitudes = await fetch(
        `${API_URL}/reservas/solicitudes_pago/${idPropietario}`
      );
      if (responseSolicitudes.ok) {
        const dataSolicitudes = await responseSolicitudes.json();
        setSolicitudes(dataSolicitudes);
      } else {
        setSolicitudes([]);
      }

      const responseSaldo = await fetch(
        `${API_URL}/reservas/pendientes_pago/${idPropietario}`
      );
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

    if (saldo <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin Saldo",
        text: "No hay saldo disponible para retirar.",
      });
      return;
    }

    if (metodoPago === "Cargando..." || metodoPago === "No registrado") {
      Swal.fire({
        icon: "error",
        title: "Método de pago inválido",
        text: "No se ha registrado un método de pago válido.",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reservas/solicitar_pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPropietario, metodoPago, numeroCuenta  }),
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.detail || "Error al solicitar el pago",
        });
      } else {
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
          numeroCuenta,
        });
      }

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
  //   Exportar a Excel
  // -------------------------
  const exportarExcel = () => {
    // Transformar cada solicitud en un objeto con columnas deseadas
    const dataExport = solicitudes.map((solicitud) => ({
      "ID Solicitud": solicitud._id,
      "Monto Solicitado": solicitud.MontoSolicitado,
      "Estado": solicitud.Estado,
      "Método de Pago": solicitud.MetodoPago,
      "Fecha Solicitud": new Date(solicitud.FechaSolicitud).toLocaleDateString(),
      "Fecha Pago Propietario": solicitud.FechaPagoPropietario
        ? new Date(solicitud.FechaPagoPropietario).toLocaleDateString()
        : "",
      "Referencia Pago": solicitud.ReferenciaPago,
      "Códigos Reserva": solicitud.codigosReserva
        ? solicitud.codigosReserva.join(", ")
        : "",
      "Banco": banco,
      "Número de Cuenta": numeroCuenta,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial Solicitudes");
    XLSX.writeFile(workbook, "HistorialSolicitudes.xlsx");
  };

  // -------------------------
  //   Preparar solicitudes para mostrar (solo 15 más recientes)
  // -------------------------
  const sortedSolicitudes = [...solicitudes].sort(
    (a, b) =>
      new Date(b.FechaSolicitud).getTime() - new Date(a.FechaSolicitud).getTime()
  );
  const solicitudesMostRecent = sortedSolicitudes.slice(0, 15);

  // -------------------------
  //   Render del componente
  // -------------------------
  return (
    <div className="SolicitarPago-container">
      <h2 className="SolicitarPago-titulo">Solicitar Pago</h2>
      <p className="SolicitarPago-saldo-disponible">
        Saldo disponible: <strong>${saldo.toLocaleString()}</strong>
      </p>
      <p className="SolicitarPago-metodo-pago">
        Método de Pago: <strong>{metodoPago}</strong>
      </p>

      <button onClick={solicitarPago} className="SolicitarPago-btn-solicitar">
        Solicitar Retiro
      </button>

      {/* Botón con texto ajustado */}
      <button onClick={exportarExcel} className="SolicitarPago-btn-exportar">
        Exportar Historial Excel
      </button>

      <h3 className="SolicitarPago-titulo">
        Historial de Solicitudes (Últimas 15)
      </h3>

      {/* Contenedor para scroll horizontal */}
      <div className="SolicitarPago-tabla-container">
        {solicitudesMostRecent.length > 0 ? (
          <table className="SolicitarPago-tabla-historial">
            <thead>
              <tr>
                <th>ID Solicitud</th>
                <th>Monto Solicitado</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
                <th>Fecha Pago</th>
                <th>Referencia</th>
                <th>Códigos Reserva</th>
                <th>Banco</th>
                <th>Número de Cuenta</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesMostRecent.map((solicitud, index) => (
                <tr
                  key={index}
                  onClick={() => verDetalles(solicitud)}
                  className="SolicitarPago-fila-solicitud"
                >
                  <td>{solicitud._id}</td>
                  <td>${solicitud.MontoSolicitado.toLocaleString()}</td>
                  <td>{solicitud.Estado}</td>
                  <td>
                    {new Date(solicitud.FechaSolicitud).toLocaleDateString()}
                  </td>
                  <td>
                    {solicitud.FechaPagoPropietario
                      ? new Date(
                          solicitud.FechaPagoPropietario
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{solicitud.ReferenciaPago || "-"}</td>
                  <td>
                    {solicitud.codigosReserva
                      ? solicitud.codigosReserva.join(", ")
                      : "-"}
                  </td>
                  <td>{banco || "-"}</td>
                  <td>{numeroCuenta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="SolicitarPago-mensaje">No hay solicitudes registradas.</p>
        )}
      </div>
    </div>
  );
};

export default SolicitarPago;
