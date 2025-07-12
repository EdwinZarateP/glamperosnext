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

    // Preparamos el payload base
    const payloadBase = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      type: "template" as const,
      template: {
        name: "notificacionmensaje",
        language: { code: "es_CO" },
        components: [
          {
            type: "body" as const,
            parameters: [
              { type: "text" as const, text: nombrePropietario },
              { type: "text" as const, text: nombreHuesped },
              { type: "text" as const, text: mensaje },
            ],
          },
        ],
      },
    };

    // Lista de destinatarios: primero el dinámico y luego el fijo
    const destinatarios = [
      numero,                // el que recibías antes
      "+573125443396"        // número adicional fijo
    ];

    for (const to of destinatarios) {
      const body = {
        ...payloadBase,
        to,
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
        console.error(`❌ Error al enviar a ${to}:`, result);
        // Si quieres que al primer fallo salga del bucle, descomenta la siguiente línea:
        // throw new Error(`Error al enviar mensaje a ${to}: ${result.error?.message || "desconocido"}`);
      } else {
        console.log(`✅ Mensaje enviado a ${to}`, result);
      }
    }

  } catch (error) {
    console.error("🚨 Error al enviar mensaje de WhatsApp:", error);
  }
};
