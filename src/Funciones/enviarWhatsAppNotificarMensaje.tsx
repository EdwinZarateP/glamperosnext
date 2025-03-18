interface EnviarWhatsAppProps {
  numero: string;
  nombrePropietario: string;
  nombreHuesped: string;
  mensaje: string;
}

export const enviarWhatsAppNotificarMensaje = async ({
  numero,
  nombrePropietario,
  nombreHuesped,
  mensaje,
}: EnviarWhatsAppProps) => {
  try {
    if (!numero) {
      throw new Error("⚠️ Error: No has actualizado tu WhatsApp.");
    }

    // 🔹 Verifica que el token esté disponible
    const whatsappApiToken = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;
    if (!whatsappApiToken) {
      throw new Error("⚠️ WHATSAPP_API_TOKEN no está definido en las variables de entorno.");
    }

    const url = "https://graph.facebook.com/v21.0/531912696676146/messages";

    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numero, // 🔹 Asegúrate de que tenga formato internacional, ej: "+573001234567"
      type: "template",
      template: {
        name: "notificacionmensaje", // 🔹 Asegúrate de que este nombre es EXACTO al de Meta Business
        language: { code: "es_CO" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: nombrePropietario },
              { type: "text", text: nombreHuesped },    
              { type: "text", text: mensaje },           
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

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Error al enviar mensaje de WhatsApp:", result);
      throw new Error(`Error al enviar mensaje: ${result.error?.message || "Error desconocido"}`);
    }

  } catch (error) {
    console.error("🚨 Error al enviar mensaje de WhatsApp:", error);
  }
};
