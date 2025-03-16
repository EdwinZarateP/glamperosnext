interface enviarCorreoPagoPropietarioProps {
    idReserva: string;
    emailCliente: string;
    montoPagado: number;
    metodoPago: string;
    numeroCuenta: string;
    fechaPago: string; // Fecha y hora en formato ISO (por ejemplo, new Date().toISOString())
    referenciaPago?: string | null;
    codigosReserva?: string[];
  }
  
  export const enviarCorreoPagoPropietario = async ({
    idReserva,
    emailCliente,
    montoPagado,
    metodoPago,
    numeroCuenta,
    fechaPago,
    referenciaPago = null,
    codigosReserva = [],
  }: enviarCorreoPagoPropietarioProps) => {
    try {
      // Se crea el contenido HTML del correo
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2F6B3E;">Pago Realizado</h2>
          <p>Estimado cliente, se ha realizado el pago correspondiente a su reserva.</p>
          <p><strong>ID de Reserva:</strong> ${idReserva}</p>
          <p><strong>Monto Pagado:</strong> $${montoPagado.toLocaleString()}</p>
          <p><strong>Método de Pago:</strong> ${metodoPago}</p>
          <p><strong>Numero de cuenta:</strong> ${numeroCuenta}</p>
          <p><strong>Estado:</strong> Pagado</p>
          <p><strong>Fecha de Pago:</strong> ${new Date(fechaPago).toLocaleDateString()}</p>
          <p><strong>Referencia de Pago:</strong> ${referenciaPago || "No disponible"}</p>
          <p><strong>Códigos de Reserva:</strong> ${
            codigosReserva.length > 0 ? codigosReserva.join(", ") : "No disponibles"
          }</p>
          <p>Gracias por confiar en nosotros.</p>
        </div>
      `;
  
      // Se realiza la petición para enviar el correo usando el endpoint de tu API
      const response = await fetch("https://glamperosapi.onrender.com/correos/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_email: "notificaciones@glamperos.com",
          email: emailCliente, // El correo del cliente
          name: "Glamperos",
          subject: "Pago Realizado - Confirmación de Pago",
          html_content: htmlContent,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error al enviar el correo al cliente:", error);
    }
  };
  