"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; // Asegúrate de tener la librería instalada: npm install xlsx
import "./estilos.css";
import { enviarCorreoContabilidad } from "../../Funciones/enviarCorreoContabilidad";

// -------------------------
//   Tipos de datos
// -------------------------
interface SolicitudPago {
  _id?: string;
  idPropietario: string;
  MontoSolicitado: number;
  Estado: string;
  MetodoPago: string;             // Nombre del banco (informativo)
  FechaSolicitud: string;         // Guardada en UTC-5 desde el backend
  FechaPagoPropietario: string | null;
  ReferenciaPago: string | null;
  codigosReserva?: string[];
}

// Datos bancarios (opcional)
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
  const API_URL = "https://glamperosapi.onrender.com"; // Ajusta si tu endpoint es distinto
  const router = useRouter();

  // Estados
  const [saldo, setSaldo] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<string>("Cargando...");
  const [solicitudes, setSolicitudes] = useState<SolicitudPago[]>([]);
  const [numeroCuenta, setNumeroCuenta] = useState<string>("No disponible");
  const [banco, setBanco] = useState<string>("");

  // -------------------------
  //   Efecto inicial
  // -------------------------
  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const resp = await fetch(`${API_URL}/reservas/pendientes_pago/${idPropietario}`);
        if (!resp.ok) {
          if (resp.status === 404) {
            setSaldo(0);
            return;
          }
          throw new Error("Error al obtener reservas pendientes");
        }
        const data = await resp.json();
        // Suma de CostoGlamping de cada reserva
        const saldoPropietario = data.reduce((acc: number, reserva: any) => acc + reserva.CostoGlamping, 0);
        setSaldo(saldoPropietario);
      } catch (error) {
        console.error("Error al obtener saldo:", error);
      }
    };

    const fetchMetodoPago = async () => {
      try {
        const resp = await fetch(`${API_URL}/usuarios/${idPropietario}/banco`);
        if (!resp.ok) {
          setMetodoPago("No registrado");
          return;
        }
        const data: Banco = await resp.json();
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
        const resp = await fetch(`${API_URL}/reservas/solicitudes_pago/${idPropietario}`);
        if (!resp.ok) {
          if (resp.status === 404) {
            setSolicitudes([]);
            return;
          }
          throw new Error("Error al obtener solicitudes de pago");
        }
        const data = await resp.json();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error al obtener solicitudes de pago:", error);
      }
    };

    // Llamadas iniciales
    fetchSaldo();
    fetchMetodoPago();
    fetchSolicitudes();
  }, [idPropietario, API_URL]);

  // -------------------------
  //   Recargar datos
  // -------------------------
  const recargarDatos = async () => {
    try {
      // Recargar solicitudes
      const respSol = await fetch(`${API_URL}/reservas/solicitudes_pago/${idPropietario}`);
      if (respSol.ok) {
        const dataSol = await respSol.json();
        setSolicitudes(dataSol);
      } else {
        setSolicitudes([]);
      }

      // Recargar saldo
      const respSaldo = await fetch(`${API_URL}/reservas/pendientes_pago/${idPropietario}`);
      if (respSaldo.ok) {
        const dataSaldo = await respSaldo.json();
        const saldoPropietario = dataSaldo.reduce((acc: number, reserva: any) => acc + reserva.CostoGlamping, 0);
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
    // Verificar si hay cuenta bancaria
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

    // Verificar método de pago
    if (metodoPago === "Cargando..." || metodoPago === "No registrado") {
      Swal.fire({
        icon: "error",
        title: "Método de pago inválido",
        text: "No se ha registrado un método de pago válido.",
      });
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/reservas/solicitar_pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPropietario, metodoPago, numeroCuenta }),
      });

      const data = await resp.json();
      if (!resp.ok) {
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

        // Notificar a contabilidad (correo)
        await enviarCorreoContabilidad({
          idSolicitud: solicitud._id,
          idPropietario,
          montoSolicitado: saldo,
          metodoPago,
          estado: solicitud.Estado,
          fechaSolicitud: solicitud.FechaSolicitud,    // UTC-5 desde backend
          fechaPago: solicitud.FechaPagoPropietario,   // UTC-5 o null
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
      html: `
        <p><strong>ID de Solicitud:</strong> ${solicitud._id}</p>
        <p><strong>Monto Solicitado:</strong> $${solicitud.MontoSolicitado.toLocaleString()}</p>
        <p><strong>Códigos de Reservas:</strong><br/>${
          solicitud.codigosReserva
            ? solicitud.codigosReserva.join("<br/>")
            : "No disponible"
        }</p>
        <p><strong>Fecha de Solicitud:</strong> ${convertirFechaColombia(solicitud.FechaSolicitud)}</p>
        <p><strong>Estado:</strong> ${solicitud.Estado}</p>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
    });
  };

  // -------------------------
  //   Convertir a Excel
  // -------------------------
  const convertirFechaColombia = (fechaUTC: string): string => {
    if (!fechaUTC) return "Sin fecha";
    
    // Convertimos a un objeto Date en UTC
    const fecha = new Date(fechaUTC);
  
    // Restamos 5 horas para ajustar al huso horario de Colombia
    fecha.setHours(fecha.getHours() - 5);
  
    // Formateamos la fecha con el huso horario de Bogotá
    return fecha.toLocaleString("es-CO", { timeZone: "America/Bogota" });
  };  

  const exportarExcel = () => {
    if (solicitudes.length === 0) {
      Swal.fire("Info", "No hay datos para exportar", "info");
      return;
    }

    const dataExport = solicitudes.map((sol) => ({
      "ID Solicitud": sol._id,
      "Monto Solicitado": sol.MontoSolicitado,
      "Estado": sol.Estado,
      "Método de Pago": sol.MetodoPago,
      "Fecha Solicitud (UTC-5)": convertirFechaColombia(sol.FechaSolicitud),
      "Fecha Pago Propietario (UTC-5)": sol.FechaPagoPropietario
        ? convertirFechaColombia(sol.FechaPagoPropietario)
        : "",
      "Referencia Pago": sol.ReferenciaPago || "",
      "Códigos Reserva": sol.codigosReserva
        ? sol.codigosReserva.join(", ")
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
  //   Historial (últimas 15)
  // -------------------------
  const sortedSolicitudes = [...solicitudes].sort(
    (a, b) =>
      new Date(b.FechaSolicitud).getTime() -
      new Date(a.FechaSolicitud).getTime()
  );
  const solicitudesMostRecent = sortedSolicitudes.slice(0, 15);

  // -------------------------
  //   Render
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

      <button onClick={exportarExcel} className="SolicitarPago-btn-exportar">
        Exportar Historial Excel
      </button>

      <h3 className="SolicitarPago-titulo">Historial de Solicitudes (Últimas 15)</h3>
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
                  <td>{convertirFechaColombia(solicitud.FechaSolicitud)}</td>
                  <td>
                    {solicitud.FechaPagoPropietario
                      ? convertirFechaColombia(solicitud.FechaPagoPropietario)
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
