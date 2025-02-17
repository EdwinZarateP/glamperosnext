"use server";

interface enviarWhatAppClienteProps {
  numero: string;
  codigoReserva: string;
  whatsapp: string;
  nombreGlampingReservado: string;
  direccionGlamping: string;
  latitud: number;
  longitud: number;
  mensaje5: string;
}

export const enviarWhatAppCliente = async ({
  numero,
  codigoReserva,
  whatsapp,
  nombreGlampingReservado,
  direccionGlamping,
  latitud,
  longitud,
  mensaje5,
}: enviarWhatAppClienteProps) => {
  try {
    if (!numero) {
      throw new Error("No has actualizado tu WhatsApp");
    }

    const url = "https://graph.facebook.com/v21.0/531912696676146/messages";
    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numero,
      type: "template",
      template: {
        name: "mensajeclientereserva",
        language: { code: "es_CO" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "location",
                location: {
                  longitude: longitud,
                  latitude: latitud,
                  name: nombreGlampingReservado,
                  address: direccionGlamping,
                },
              },
            ],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: mensaje5 },
              { type: "text", text: codigoReserva },
              { type: "text", text: whatsapp },
            ],
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error al enviar el mensaje: ${errorData.error.message}`);
    }

    console.log(`Mensaje enviado correctamente a ${numero}`);
  } catch (error) {
    console.error("Error al enviar mensaje de WhatsApp:", error);
  }
};
