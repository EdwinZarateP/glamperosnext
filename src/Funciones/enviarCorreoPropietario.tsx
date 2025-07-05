// "use server";

interface EnviarCorreoPropietarioProps {
  correo: string;
  nombre: string;
  codigoReserva: string;
  fechaInicio: Date;
  fechaFin: Date;
  Cantidad_Adultos: number;
  Cantidad_Ninos: number;
  Cantidad_Mascotas: number;
  telefonoUsuario: string;
  correoUsuario: string;
  glampingNombre: string;
  fromEmail?: string;
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const enviarCorreoPropietario = async ({
  correo,
  nombre,
  codigoReserva,
  fechaInicio,
  fechaFin,
  Cantidad_Adultos,
  Cantidad_Ninos,
  Cantidad_Mascotas,
  telefonoUsuario,
  correoUsuario,
  glampingNombre,
  fromEmail = "reservaciones@glamperos.com",
}: EnviarCorreoPropietarioProps) => {
  try {
    // 🔹 Remover el prefijo "57" si el número empieza con él
    if (telefonoUsuario.startsWith("57")) {
      telefonoUsuario = telefonoUsuario.slice(2);
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2F6B3E;">🎉 ¡Tienes una nueva reserva!</h2>
        <p>Hola ${nombre.split(" ")[0]},</p>
        <p>¡Alguien ha reservado <strong>${glampingNombre}</strong> a través de Glamperos! Aquí tienes los detalles de la reserva:</p>
        <p><strong>Código de Reserva:</strong> ${codigoReserva}</p>
        <p><strong>Check-In:</strong> ${fechaInicio.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
        <p><strong>Check-Out:</strong> ${fechaFin.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
        <p><strong>Adultos:</strong> ${Cantidad_Adultos}</p>
        <p><strong>Niños:</strong> ${Cantidad_Ninos}</p>
        <p><strong>Mascotas:</strong> ${Cantidad_Mascotas}</p>
        <p>
          📞 <strong>Contacto del huésped:</strong> 
          <br>WhatsApp: ${telefonoUsuario}
          <br>Correo: ${correoUsuario}
        </p>
        <p>Si necesitas ayuda o tienes preguntas, nuestro equipo estará siempre aquí para ti.</p>
        <p>¡Hagamos de esta aventura una experiencia inolvidable para nuestro huésped!</p>
        <p style="margin: 20px 0;">El equipo de <strong style="color: #2F6B3E;">Glamperos</strong>.</p>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 1em; color: #777;">
          Si tienes preguntas, no dudes en ponerte en contacto con nosotros a través de nuestro portal.
        </p>
      </div>
    `;

    const response = await fetch(`${API_BASE}/correos/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_email: fromEmail,
        email: correo,
        name: nombre,
        subject: `🎫 Reserva Confirmada - ${glampingNombre}`,
        html_content: htmlContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};
