interface EnviarCorreoProps {
  correo: string;
  nombre: string;
  codigoReserva: string;
  fechaInicio: Date;
  fechaFin: Date;
  Cantidad_Adultos: number;
  Cantidad_Ninos: number;
  Cantidad_Mascotas: number;
  usuarioWhatsapp: string;
  glampingNombre: string;
  latitud?: number;
  longitud?: number;
  fromEmail?: string;
}

export const enviarCorreoCliente = async ({
  correo,
  nombre,
  codigoReserva,
  fechaInicio,
  fechaFin,
  Cantidad_Adultos,
  Cantidad_Ninos,
  Cantidad_Mascotas,
  usuarioWhatsapp,
  glampingNombre,
  latitud,
  longitud,
  fromEmail = "reservas@glamperos.com",
}: EnviarCorreoProps) => {
  try {
    const googleMapsLink = latitud && longitud 
      ? `https://www.google.com/maps?q=${latitud},${longitud}`
      : "#";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2F6B3E;">🎉 ¡Hora de relajarse!</h2>
        <p>Hola ${nombre.split(" ")[0]},</p>
        <p>¡Gracias por reservar con Glamperos! 🎉 Aquí tienes los detalles de tu reserva:</p>
        <p><strong>Código de Reserva:</strong> ${codigoReserva}</p>
        <p><strong>Check-In:</strong> ${fechaInicio.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
        <p><strong>Check-Out:</strong> ${fechaFin.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
        <p><strong>Adultos:</strong> ${Cantidad_Adultos}</p>
        <p><strong>Niños:</strong> ${Cantidad_Ninos}</p>
        <p><strong>Mascotas:</strong> ${Cantidad_Mascotas}</p>
        <p>El contacto de WhatsApp de tu anfitrión es <strong>${usuarioWhatsapp}</strong>, escríbele para estar en contacto.</p>
        <p>
          La ubicación de tu glamping es la siguiente: 
          <a href="${googleMapsLink}" target="_blank" style="color: #2F6B3E;">Ver en Google Maps</a>
        </p>
        <p>Si necesitas ayuda o tienes preguntas, nuestro equipo estará siempre aquí para ti.</p>
        <p>¡Juntos haremos que esta aventura sea inolvidable!</p>
        <p style="margin: 20px 0;">El equipo de <strong style="color: #2F6B3E;">Glamperos</strong>.</p>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 1em; color: #777;">
          Si tienes preguntas, no dudes en ponerte en contacto con nosotros a través de nuestro portal.
        </p>
      </div>
    `;

    const response = await fetch("https://glamperosapi.onrender.com/correos/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_email: fromEmail,
        email: correo,
        name: nombre,
        subject: `🧳 Confirmación Reserva Glamping - ${glampingNombre}`,
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
