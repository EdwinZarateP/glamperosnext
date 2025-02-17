interface EnviarWhatAppClienteProps {
  numero: string;
  codigoReserva: string;
  whatsapp: string;
  nombreGlampingReservado: string;
  direccionGlamping: string;
  latitud: number;
  longitud: number;
  nombreCliente: string;
}

export const enviarWhatAppCliente = async ({
  numero,
  codigoReserva,
  whatsapp,
  nombreGlampingReservado,
  direccionGlamping,
  latitud,
  longitud,
  nombreCliente,
}: EnviarWhatAppClienteProps) => {
  try {
    if (!numero) {
      throw new Error("No has actualizado tu WhatsApp");
    }

    // 🔹 Obtener el token de entorno (local o producción)
    const whatsappApiToken = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;

    if (!whatsappApiToken) {
      throw new Error("⚠️ WHATSAPP_API_TOKEN no está definido en las variables de entorno.");
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
              { type: "text", text: nombreCliente },
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
        Authorization: `Bearer ${whatsappApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error al enviar mensaje de WhatsApp:", errorData);
      throw new Error(`Error al enviar mensaje: ${errorData.error?.message || "Error desconocido"}`);
    }
  } catch (error) {
    console.error("🚨 Error al enviar mensaje de WhatsApp:", error);
  }
};
