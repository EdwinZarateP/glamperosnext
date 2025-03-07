// enviarCorreoContabilidad.ts

interface EnviarCorreoContabilidadProps {
  idSolicitud: string;
  idPropietario: string;
  montoSolicitado: number;
  metodoPago: string;
  estado: string;
  fechaSolicitud: string;
  fechaPago?: string | null;
  referenciaPago?: string | null;
  codigosReserva?: string[];
  numeroCuenta?: string;
}

export const enviarCorreoContabilidad = async ({
  idSolicitud,
  idPropietario,
  montoSolicitado,
  metodoPago,
  estado,
  fechaSolicitud,
  fechaPago = null,
  referenciaPago = null,
  codigosReserva = [],
  numeroCuenta = "No disponible",
}: EnviarCorreoContabilidadProps) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2F6B3E;">Nueva Solicitud de Pago</h2>
        <p><strong>ID de Solicitud:</strong> ${idSolicitud || "No disponible"}</p>
        <p><strong>ID Propietario:</strong> ${idPropietario}</p>
        <p><strong>Monto Solicitado:</strong> $${montoSolicitado.toLocaleString()}</p>
        <p><strong>Método de Pago:</strong> ${metodoPago}</p>
        <p><strong>Estado:</strong> ${estado || "No disponible"}</p>
        <p><strong>Fecha de Solicitud:</strong> ${
          fechaSolicitud ? new Date(fechaSolicitud).toLocaleDateString() : "No disponible"
        }</p>
        <p><strong>Fecha de Pago:</strong> ${
          fechaPago ? new Date(fechaPago).toLocaleDateString() : "Pendiente"
        }</p>
        <p><strong>Referencia de Pago:</strong> ${referenciaPago || "No disponible"}</p>
        <p><strong>Códigos de Reserva:</strong><br/>${
          codigosReserva.length > 0 ? codigosReserva.join("<br/>") : "No disponibles"
        }</p>
        <p><strong>Número de Cuenta:</strong> ${numeroCuenta}</p>
      </div>
    `;

    const response = await fetch("https://glamperosapi.onrender.com/correos/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_email: "notificaciones@glamperos.com",
        email: "contabilidad@glamperos.com",
        name: "Contabilidad",
        subject: "Nueva Solicitud de Pago",
        html_content: htmlContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error al enviar el correo a contabilidad:", error);
  }
};
