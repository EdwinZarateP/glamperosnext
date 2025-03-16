"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; // npm install xlsx
import "./estilos.css";
import { enviarCorreoPagoPropietario } from "@/Funciones/enviarCorreoPagoPropietario";

// Definición de la solicitud de pago según la API
interface SolicitudPago {
  _id: string;
  idPropietario: string;
  MontoSolicitado: number;
  Estado: string;
  MetodoPago?: string; // Nombre del banco (informativo)
  numeroCuenta: string;
  FechaSolicitud: string;
  FechaPagoPropietario?: string;
  ReferenciaPago?: string;
  codigosReserva?: string[];
  Banco?: string; // Nombre del banco si lo manejas así
}

const API_URL = "https://glamperosapi.onrender.com";

export default function PagosContables() {
  // Estado para la validación de clave
  const [claveAdmin, setClaveAdmin] = useState("");
  const [claveValida, setClaveValida] = useState(false);

  // Lista de solicitudes y las referencias (editables)
  const [solicitudes, setSolicitudes] = useState<SolicitudPago[]>([]);
  const [referenciasPago, setReferenciasPago] = useState<Record<string, string>>({});

  // Cargar solicitudes si la clave es válida
  useEffect(() => {
    if (claveValida) {
      obtenerSolicitudesPago();
    }
  }, [claveValida]);

  // ----------------------------------------------------------------------------
  // OBTENER SOLICITUDES DE PAGO PENDIENTES
  // ----------------------------------------------------------------------------
  const obtenerSolicitudesPago = async () => {
    try {
      const resp = await fetch(`${API_URL}/reservas/solicitudes_pago_pendientes`);
      if (!resp.ok) {
        Swal.fire("Error", "No se pudieron obtener las solicitudes de pago", "error");
        return;
      }
      const data = await resp.json();
      setSolicitudes(data);

      // Inicializamos las referencias
      const referenciasIniciales: Record<string, string> = {};
      data.forEach((sol: SolicitudPago) => {
        referenciasIniciales[sol._id] = sol.ReferenciaPago || "";
      });
      setReferenciasPago(referenciasIniciales);
    } catch (error) {
      console.error("Error al obtener solicitudes de pago:", error);
      Swal.fire("Error", "Error al obtener solicitudes de pago", "error");
    }
  };

  // ----------------------------------------------------------------------------
  // MANEJAR CAMBIO DE REFERENCIA
  // ----------------------------------------------------------------------------
  const handleReferenciaPagoChange = (solicitudId: string, nuevaReferencia: string) => {
    setReferenciasPago((prev) => ({ ...prev, [solicitudId]: nuevaReferencia }));
  };

  // ----------------------------------------------------------------------------
  // CONFIRMAR PAGO
  // ----------------------------------------------------------------------------
  const confirmarPago = async (sol: SolicitudPago) => {
    const metodoBanco = sol.MetodoPago || sol.Banco || "";
    const numeroCuenta = sol.numeroCuenta || "";
    const referencia = referenciasPago[sol._id] || "";

    if (!metodoBanco || !referencia) {
      Swal.fire("Atención", "El banco informativo y la referencia son obligatorios", "warning");
      return;
    }

    if (!sol.codigosReserva || sol.codigosReserva.length === 0) {
      Swal.fire("Error", "No hay códigos de reserva en esta solicitud", "error");
      return;
    }

    const fechaPago = new Date().toISOString();

    try {
      // 1. Para cada código de reserva, hacemos PUT a /pago_por_codigo
      for (const codigo of sol.codigosReserva) {
        const respReserva = await fetch(`${API_URL}/reservas/pago_por_codigo/${encodeURIComponent(codigo)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            EstadoPago: "Pagado",
            MetodoPago: metodoBanco,
            FechaPagoPropietario: fechaPago,
            ReferenciaPago: referencia,
            EstadoPagoProp: "Pagado",
          }),
        });

        if (!respReserva.ok) {
          const errorData = await respReserva.json();
          Swal.fire(
            "Error",
            typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail),
            "error"
          );
          return;
        }
      }

      // 2. Actualizar la solicitud de pago (una sola vez)
      const respSolicitud = await fetch(`${API_URL}/reservas/actualizar_solicitud_pago/${sol._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Estado: "Pagado",
          FechaPagoPropietario: fechaPago,
          MetodoPago: metodoBanco,
          ReferenciaPago: referencia,
        }),
      });
      if (!respSolicitud.ok) {
        const errorData = await respSolicitud.json();
        Swal.fire(
          "Error",
          typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail),
          "error"
        );
        return;
      }

      // 3. Obtener el email del propietario
      const emailCliente = await obtenerEmailPropietario(sol.idPropietario);
      if (!emailCliente) {
        Swal.fire("Error", "No se encontró el correo del propietario", "error");
        return;
      }

      // 4. Enviar correo al propietario
      await enviarCorreoPagoPropietario({
        idReserva: sol._id, // ID de la solicitud
        emailCliente,
        montoPagado: sol.MontoSolicitado,
        metodoPago: metodoBanco,
        numeroCuenta: numeroCuenta,
        fechaPago,
        referenciaPago: referencia,
        codigosReserva: sol.codigosReserva || [],
      });

      Swal.fire("Éxito", "Pago confirmado y notificación enviada", "success");
      obtenerSolicitudesPago();
    } catch (error) {
      console.error("Error al confirmar pago:", error);
      Swal.fire("Error", "Ocurrió un error al confirmar el pago", "error");
    }
  };

  // ----------------------------------------------------------------------------
  // OBTENER EMAIL DEL PROPIETARIO
  // ----------------------------------------------------------------------------
  const obtenerEmailPropietario = async (idPropietario: string): Promise<string | null> => {
    try {
      const resp = await fetch(`${API_URL}/usuarios/${idPropietario}`);
      if (!resp.ok) return null;
      const data: { email: string } = await resp.json();
      return data.email;
    } catch (error) {
      console.error("Error al obtener email del propietario:", error);
      return null;
    }
  };

  // ----------------------------------------------------------------------------
  // EXPORTAR A EXCEL
  // ----------------------------------------------------------------------------
  const exportarExcel = () => {
    if (solicitudes.length === 0) {
      Swal.fire("Info", "No hay datos para exportar", "info");
      return;
    }
    const dataExport = solicitudes.map(sol => ({
      "ID Solicitud": sol._id,
      "Propietario": sol.idPropietario,
      "Códigos Reserva": sol.codigosReserva ? sol.codigosReserva.join(", ") : "-",
      "Monto Solicitado": sol.MontoSolicitado,
      "Banco": sol.MetodoPago || "-",
      "Número de Cuenta": sol.numeroCuenta || "-",
      "Referencia": referenciasPago[sol._id] || "-",
      "Fecha Solicitud": new Date(sol.FechaSolicitud).toLocaleDateString(),
      "Fecha Pago": sol.FechaPagoPropietario ? new Date(sol.FechaPagoPropietario).toLocaleDateString() : "-",
      "Estado": sol.Estado,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos Contables");
    XLSX.writeFile(workbook, "PagosContables.xlsx");
  };

  // ----------------------------------------------------------------------------
  // VALIDAR CLAVE ADMINISTRADOR
  // ----------------------------------------------------------------------------
  const validarClave = () => {
    if (claveAdmin === "glamperos*") {
      setClaveValida(true);
    } else {
      Swal.fire("Clave incorrecta", "La clave ingresada no es válida", "error");
    }
  };

  // ----------------------------------------------------------------------------
  // RENDER (si la clave no es válida, mostramos input)
  // ----------------------------------------------------------------------------
  if (!claveValida) {
    return (
      <div className="PagosContables-contenedor">
        <h2 className="PagosContables-titulo">Área Contable</h2>
        <input
          type="password"
          placeholder="Ingrese clave de administrador"
          value={claveAdmin}
          onChange={(e) => setClaveAdmin(e.target.value)}
          className="PagosContables-input-clave"
        />
        <button onClick={validarClave} className="PagosContables-boton-validar">
          Validar Clave
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // RENDER PRINCIPAL (si la clave es válida)
  // ----------------------------------------------------------------------------
  return (
    <div className="PagosContables-contenedor">
      <h2 className="PagosContables-titulo">Gestión de Pagos</h2>
      <button className="PagosContables-boton-exportar" onClick={exportarExcel}>
        Exportar Historial Excel
      </button>
      {solicitudes.length === 0 ? (
        <p className="PagosContables-mensaje">No hay pagos solicitados</p>
      ) : (
        <div className="PagosContables-tabla-container">
          <table className="PagosContables-tabla">
            <thead>
              <tr>
                <th>Propietario</th>
                <th>Monto</th>
                <th>Banco</th>
                <th>N° Cuenta</th>
                <th>Referencia</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(sol => (
                <tr key={sol._id} className="PagosContables-fila">
                  <td>{sol.idPropietario}</td>
                  <td>${sol.MontoSolicitado.toLocaleString()}</td>
                  <td>{sol.MetodoPago || "-"}</td>
                  <td>{sol.numeroCuenta || "-"}</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Ingrese referencia"
                      value={referenciasPago[sol._id] || ""}
                      onChange={e => handleReferenciaPagoChange(sol._id, e.target.value)}
                      className="PagosContables-input-referencia"
                    />
                  </td>
                  <td>
                    <button className="PagosContables-boton-confirmar" onClick={() => confirmarPago(sol)}>
                      Confirmar Pago
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
